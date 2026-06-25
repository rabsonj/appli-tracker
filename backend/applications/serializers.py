from rest_framework import serializers
from applications import models as application_models
from users import serializers as user_serializers


class AuditLogSerializer(serializers.ModelSerializer):
    """Serializer for the AuditLog model."""

    actor = user_serializers.UserSerializer(read_only=True)

    class Meta:
        model = application_models.AuditLog
        fields = ("id", "actor", "from_status", "to_status", "comment", "created_at")


class ApplicationSerializer(serializers.ModelSerializer):
    """Read-only serializer for the Application model, including nested data."""

    owner = user_serializers.UserSerializer(read_only=True)
    audit_logs = AuditLogSerializer(many=True, read_only=True)

    class Meta:
        model = application_models.Application
        fields = (
            "id",
            "owner",
            "title",
            "category",
            "description",
            "amount",
            "status",
            "created_at",
            "updated_at",
            "audit_logs",
        )
        read_only_fields = (
            "id",
            "owner",
            "status",
            "created_at",
            "updated_at",
            "audit_logs",
        )


class ApplicationWriteSerializer(serializers.ModelSerializer):
    """Write serializer for creating and updating Application instances."""

    audit_logs = AuditLogSerializer(many=True, read_only=True)

    class Meta:
        model = application_models.Application
        fields = (
            "id",
            "owner",
            "title",
            "category",
            "description",
            "amount",
            "status",
            "created_at",
            "updated_at",
            "audit_logs",
        )
        read_only_fields = (
            "id",
            "owner",
            "status",
            "created_at",
            "updated_at",
            "audit_logs",
        )

    def validate_category(self, value: str) -> str:
        """Ensures the provided category is a valid choice.

        Args:
            value: The category string submitted by the user.

        Returns:
            The validated category string.

        Raises:
            serializers.ValidationError: If the category is not a valid choice.
        """
        valid = [c[0] for c in application_models.Application.CATEGORY_CHOICES]
        if value not in valid:
            raise serializers.ValidationError(f"Must be one of: {', '.join(valid)}")
        return value


class TransitionCommentSerializer(serializers.Serializer):
    """Serializer for transition actions that require a comment."""

    comment = serializers.CharField(
        required=True,
        allow_blank=False,
        error_messages={"blank": "A comment is required for this action."},
    )
