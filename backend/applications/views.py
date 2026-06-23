from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from applications import models as application_models
from applications import serializers as application_serializers
from applications import permissions as application_permissions
from common import permissions as common_permissions


class ApplicationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = application_models.Application.objects.select_related("owner").prefetch_related(
            "audit_logs__actor"
        )

        if user.is_reviewer:
            status_filter = self.request.query_params.get("status")
            if status_filter:
                qs = qs.filter(status=status_filter)
            return qs

        return qs.filter(owner=user)

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return application_serializers.ApplicationWriteSerializer
        return application_serializers.ApplicationSerializer

    def get_permissions(self):
        if self.action == "create":
            return [IsAuthenticated(), common_permissions.IsApplicant()]
        if self.action in ("update", "partial_update"):
            return [IsAuthenticated(), application_permissions.CanEditApplication()]
        if self.action == "destroy":
            return [IsAuthenticated(), application_permissions.IsOwner()]
        return [IsAuthenticated(), application_permissions.IsOwnerOrReviewer()]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        self.check_object_permissions(request, instance)
        return Response(application_serializers.ApplicationSerializer(instance).data)
