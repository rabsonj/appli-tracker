from typing import Any, Callable, Type

from django.db import transaction
from django.db.models import QuerySet
from django_fsm import TransitionNotAllowed
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.serializers import BaseSerializer

from common.permissions import IsApplicant, IsReviewer

from .models import Application, AuditLog
from .permissions import CanEditApplication, IsOwner, IsOwnerOrReviewer
from .serializers import (
    ApplicationSerializer,
    ApplicationWriteSerializer,
    AuditLogSerializer,
    TransitionCommentSerializer,
)


class ApplicationViewSet(viewsets.ModelViewSet):
    """
    Provides CRUD and state transition endpoints for Applications.

    - Applicants can create, view, edit (in draft), and submit their own applications.
    - Reviewers can view all applications and perform state transitions.
    """

    permission_classes = [IsAuthenticated]

    def get_queryset(self) -> QuerySet[Application]:
        """
        Gets the queryset of applications visible to the current user.

        Reviewers can see all applications and filter by status.
        Applicants can only see their own applications.

        Returns:
            A queryset of Application instances.
        """
        user = self.request.user
        qs = Application.objects.select_related("owner").prefetch_related(
            "audit_logs__actor"
        )
        if user.is_reviewer is True:
            status_filter = self.request.query_params.get("status")
            if status_filter:
                qs = qs.filter(status=status_filter)
            return qs
        return qs.filter(owner=user)

    def get_serializer_class(self) -> Type[BaseSerializer]:
        """
        Returns the appropriate serializer class based on the action.

        Uses a write-optimized serializer for create/update actions and a
        read-optimized serializer for all other actions.

        Returns:
            The serializer class.
        """
        if self.action in ("create", "update", "partial_update"):
            return ApplicationWriteSerializer
        return ApplicationSerializer

    def get_permissions(self) -> list[BasePermission]:
        """
        Returns the appropriate permission classes based on the action.

        This provides granular control over who can perform which action on
        an application.

        Returns:
            A list of permission instances.
        """
        if self.action == "create":
            return [IsAuthenticated(), IsApplicant()]
        if self.action in ("update", "partial_update"):
            return [IsAuthenticated(), CanEditApplication()]
        if self.action == "destroy":
            return [IsAuthenticated(), IsOwner()]
        if self.action == "submit":
            return [IsAuthenticated(), IsApplicant()]
        if self.action in ("start_review", "approve", "reject", "return_for_changes"):
            return [IsAuthenticated(), IsReviewer()]
        return [IsAuthenticated(), IsOwnerOrReviewer()]

    def create(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        Creates a new application for the authenticated user.

        The application is created with the requesting user as the owner.

        Args:
            request: The request instance.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        Returns:
            A Response object with the created application data.
        """
        write_serializer = ApplicationWriteSerializer(data=request.data)
        write_serializer.is_valid(raise_exception=True)
        application = write_serializer.save(owner=request.user)
        return Response(
            ApplicationSerializer(application).data,
            status=status.HTTP_201_CREATED,
        )

    def retrieve(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        Retrieves a single application instance after checking permissions.

        Args:
            request: The request instance.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        Returns:
            A Response object with the application data.
        """
        instance = self.get_object()
        self.check_object_permissions(request, instance)
        return Response(ApplicationSerializer(instance).data)

    # ------------------------------------------------------------------ #
    # Transition helper                                                    #
    # ------------------------------------------------------------------ #

    def _do_transition(
        self,
        request: Request,
        transition_fn: Callable[[Application], None],
        from_status: str,
        to_status: str,
        comment: str = "",
    ) -> Response:
        """
        Helper method to perform a state transition and log it atomically.

        This method locks the application row for update, performs the transition,
        and creates an audit log entry. It handles and reports transition errors.

        Args:
            request: The request instance.
            transition_fn: The FSM transition method to call on the application.
            from_status: The expected starting status.
            to_status: The expected ending status.
            comment: An optional comment for the audit log.

        Returns:
            A Response object with the updated application data or an error.
        """
        application = self.get_object()
        self.check_object_permissions(request, application)

        try:
            with transaction.atomic():
                # Lock row to prevent race conditions
                application = Application.objects.select_for_update().get(
                    pk=application.pk
                )
                transition_fn(application)
                application.save()
                AuditLog.objects.create(
                    application=application,
                    actor=request.user,
                    from_status=from_status,
                    to_status=to_status,
                    comment=comment,
                )
        except TransitionNotAllowed:
            return Response(
                {
                    "error": "transition_not_allowed",
                    "detail": (
                        f"Cannot perform this action from '{application.status}' status."
                    ),
                    "status_code": 400,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            ApplicationSerializer(application).data,
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def submit(self, request: Request, pk: int | None = None) -> Response:
        """
        Endpoint to transition an application from 'draft' to 'submitted'.

        Args:
            request: The request instance.
            pk: The primary key of the application.

        Returns:
            A Response object with the updated application data.
        """
        return self._do_transition(
            request,
            lambda app: app.submit(),
            from_status=Application.DRAFT,
            to_status=Application.SUBMITTED,
        )

    @action(detail=True, methods=["post"], url_path="start-review")
    def start_review(self, request: Request, pk: int | None = None) -> Response:
        """
        Endpoint to transition an application from 'submitted' to 'under_review'.

        Args:
            request: The request instance.
            pk: The primary key of the application.

        Returns:
            A Response object with the updated application data.
        """
        return self._do_transition(
            request,
            lambda app: app.start_review(),
            from_status=Application.SUBMITTED,
            to_status=Application.UNDER_REVIEW,
        )

    @action(detail=True, methods=["post"])
    def approve(self, request: Request, pk: int | None = None) -> Response:
        """
        Endpoint to transition an application from 'under_review' to 'approved'.

        Args:
            request: The request instance.
            pk: The primary key of the application.

        Returns:
            A Response object with the updated application data.
        """
        return self._do_transition(
            request,
            lambda app: app.approve(),
            from_status=Application.UNDER_REVIEW,
            to_status=Application.APPROVED,
        )

    @action(detail=True, methods=["post"])
    def reject(self, request: Request, pk: int | None = None) -> Response:
        """
        Endpoint to transition an application from 'under_review' to 'rejected'.

        This action requires a comment.

        Args:
            request: The request instance, containing a 'comment' in its body.
            pk: The primary key of the application.

        Returns:
            A Response object with the updated application data or a validation error.
        """
        serializer = TransitionCommentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "error": "validation_error",
                    "detail": serializer.errors,
                    "status_code": 400,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        return self._do_transition(
            request,
            lambda app: app.reject(),
            from_status=Application.UNDER_REVIEW,
            to_status=Application.REJECTED,
            comment=serializer.validated_data["comment"],
        )

    @action(detail=True, methods=["post"], url_path="return-for-changes")
    def return_for_changes(self, request: Request, pk: int | None = None) -> Response:
        """
        Endpoint to transition an application from 'under_review' back to 'draft'.

        This action requires a comment explaining why it's being returned.

        Args:
            request: The request instance, containing a 'comment' in its body.
            pk: The primary key of the application.

        Returns:
            A Response object with the updated application data or a validation error.
        """
        serializer = TransitionCommentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "error": "validation_error",
                    "detail": serializer.errors,
                    "status_code": 400,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        return self._do_transition(
            request,
            lambda app: app.return_for_changes(),
            from_status=Application.UNDER_REVIEW,
            to_status=Application.DRAFT,
            comment=serializer.validated_data["comment"],
        )

    @action(detail=True, methods=["get"], url_path="audit-log")
    def audit_log(self, request: Request, pk: int | None = None) -> Response:
        """
        Endpoint to retrieve the audit log for a specific application.

        Args:
            request: The request instance.
            pk: The primary key of the application.

        Returns:
            A Response object containing a list of audit log entries.
        """
        application = self.get_object()
        self.check_object_permissions(request, application)
        logs = application.audit_logs.all()
        return Response(AuditLogSerializer(logs, many=True).data)
