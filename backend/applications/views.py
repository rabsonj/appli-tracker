from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_fsm import TransitionNotAllowed

from .models import Application, AuditLog
from .serializers import (
    ApplicationSerializer,
    ApplicationWriteSerializer,
    AuditLogSerializer,
    TransitionCommentSerializer,
)
from .permissions import IsOwner, IsOwnerOrReviewer, CanEditApplication
from common.permissions import IsApplicant, IsReviewer


class ApplicationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
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

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return ApplicationWriteSerializer
        return ApplicationSerializer

    def get_permissions(self):
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

    def create(self, request, *args, **kwargs):
        write_serializer = ApplicationWriteSerializer(data=request.data)
        write_serializer.is_valid(raise_exception=True)
        application = write_serializer.save(owner=request.user)
        return Response(
            ApplicationSerializer(application).data,
            status=status.HTTP_201_CREATED,
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        self.check_object_permissions(request, instance)
        return Response(ApplicationSerializer(instance).data)

    # ------------------------------------------------------------------ #
    # Transition helper                                                    #
    # ------------------------------------------------------------------ #

    def _do_transition(self, request, transition_fn, from_status, to_status, comment=""):
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
    def submit(self, request, pk=None):
        return self._do_transition(
            request,
            lambda app: app.submit(),
            from_status=Application.DRAFT,
            to_status=Application.SUBMITTED,
        )

    @action(detail=True, methods=["post"], url_path="start-review")
    def start_review(self, request, pk=None):
        return self._do_transition(
            request,
            lambda app: app.start_review(),
            from_status=Application.SUBMITTED,
            to_status=Application.UNDER_REVIEW,
        )

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        return self._do_transition(
            request,
            lambda app: app.approve(),
            from_status=Application.UNDER_REVIEW,
            to_status=Application.APPROVED,
        )

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
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
    def return_for_changes(self, request, pk=None):
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
    def audit_log(self, request, pk=None):
        application = self.get_object()
        self.check_object_permissions(request, application)
        logs = application.audit_logs.all()
        return Response(AuditLogSerializer(logs, many=True).data)
