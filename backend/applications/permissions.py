from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework.request import Request
from rest_framework.views import APIView

from applications.models import Application


class IsOwner(BasePermission):
    """Permission to only allow the owner of an object to access it."""

    message = "You must be the owner of this application."

    def has_object_permission(
        self, request: Request, view: APIView, obj: Application
    ) -> bool:
        """Checks if the request.user is the owner of the application.

        Args:
            request: The request instance.
            view: The view instance.
            obj: The Application instance.

        Returns:
            True if the user is the owner, False otherwise.
        """
        return obj.owner == request.user


class IsOwnerOrReviewer(BasePermission):
    """Permission to allow owners or reviewers to access an object."""

    message = "You must be the owner or a reviewer."

    def has_object_permission(
        self, request: Request, view: APIView, obj: Application
    ) -> bool:
        """Checks if the user is the owner or has the reviewer role.

        Args:
            request: The request instance.
            view: The view instance.
            obj: The Application instance.

        Returns:
            True if the user is the owner or a reviewer, False otherwise.
        """
        return obj.owner == request.user or request.user.is_reviewer


class CanEditApplication(BasePermission):
    """Permission to edit an application only while it is in 'draft' status."""

    message = "Applications can only be edited by their owner while in draft status."

    def has_object_permission(
        self, request: Request, view: APIView, obj: Application
    ) -> bool:
        """Checks if the user can edit the application.

        Allows read-only methods for all. For write methods, checks if the user
        is the owner and the application is in 'draft' status.

        Args:
            request: The request instance.
            view: The view instance.
            obj: The Application instance.

        Returns:
            True if the user has permission, False otherwise.
        """
        if request.method in SAFE_METHODS:
            return True
        return obj.owner == request.user and obj.status == "draft"
