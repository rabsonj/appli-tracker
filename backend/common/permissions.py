from rest_framework.permissions import BasePermission
from rest_framework.request import Request
from rest_framework.views import APIView


class IsApplicant(BasePermission):
    """Permission to only allow users with the 'applicant' role."""

    message = "Only applicants can perform this action."

    def has_permission(self, request: Request, view: APIView) -> bool:
        """Checks if the user is an authenticated applicant.

        Args:
            request: The request instance.
            view: The view instance.

        Returns:
            True if the user is an authenticated applicant, False otherwise.
        """
        return bool(
            request.user and request.user.is_authenticated and request.user.is_applicant
        )


class IsReviewer(BasePermission):
    """Permission to only allow users with the 'reviewer' role."""

    message = "Only reviewers can perform this action."

    def has_permission(self, request: Request, view: APIView) -> bool:
        """Checks if the user is an authenticated reviewer.

        Args:
            request: The request instance.
            view: The view instance.

        Returns:
            True if the user is an authenticated reviewer, False otherwise.
        """
        return bool(
            request.user and request.user.is_authenticated and request.user.is_reviewer
        )
