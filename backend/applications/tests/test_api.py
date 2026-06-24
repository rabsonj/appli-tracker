"""
Tests for API authorization and permissions.

Verifies that:
- Unauthenticated users are denied access.
- Users can only perform actions allowed by their role (Applicant vs. Reviewer).
- Users can only access objects they own or have permission to view.
"""

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from applications import models as application_models

# Unauthenticated Access Tests
# ==============================================================================


@pytest.mark.django_db
class TestUnauthenticatedAccess:
    """Tests that unauthenticated users receive 401 Unauthorized errors."""

    def test_list_applications_unauthenticated(self, api_client: APIClient) -> None:
        url = reverse("application-list")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_application_unauthenticated(self, api_client: APIClient) -> None:
        url = reverse("application-list")
        response = api_client.post(url, data={"title": "test"})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_retrieve_application_unauthenticated(
        self, api_client: APIClient, draft_application: application_models.Application
    ) -> None:
        url = reverse("application-detail", kwargs={"pk": draft_application.pk})
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_submit_application_unauthenticated(
        self, api_client: APIClient, draft_application: application_models.Application
    ) -> None:
        url = reverse("application-submit", kwargs={"pk": draft_application.pk})
        response = api_client.post(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# Applicant Permission Tests
# ==============================================================================


@pytest.mark.django_db
class TestApplicantPermissions:
    """Tests the permissions for a user with the 'applicant' role."""

    def test_applicant_can_create_application(
        self, applicant_client: APIClient
    ) -> None:
        url = reverse("application-list")
        data = {"title": "New App", "category": "general"}
        response = applicant_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED

    def test_applicant_can_list_own_applications(
        self,
        applicant_client: APIClient,
        draft_application: application_models.Application,
    ) -> None:
        url = reverse("application-list")
        response = applicant_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["id"] == draft_application.id

    def test_applicant_cannot_see_other_applications_in_list(
        self,
        applicant_client: APIClient,
        other_application: application_models.Application,
    ) -> None:
        url = reverse("application-list")
        response = applicant_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert not any(app["id"] == other_application.id for app in response.data)

    def test_applicant_cannot_retrieve_other_application(
        self,
        applicant_client: APIClient,
        other_application: application_models.Application,
    ) -> None:
        url = reverse("application-detail", kwargs={"pk": other_application.pk})
        response = applicant_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_applicant_can_edit_own_draft_application(
        self,
        applicant_client: APIClient,
        draft_application: application_models.Application,
    ) -> None:
        url = reverse("application-detail", kwargs={"pk": draft_application.pk})
        response = applicant_client.patch(url, data={"title": "Updated Title"})
        assert response.status_code == status.HTTP_200_OK
        assert response.data["title"] == "Updated Title"

    def test_applicant_cannot_edit_own_submitted_application(
        self,
        applicant_client: APIClient,
        submitted_application: application_models.Application,
    ) -> None:
        url = reverse("application-detail", kwargs={"pk": submitted_application.pk})
        response = applicant_client.patch(url, data={"title": "Updated Title"})
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_applicant_cannot_approve_application(
        self,
        applicant_client: APIClient,
        under_review_application: application_models.Application,
    ) -> None:
        url = reverse("application-approve", kwargs={"pk": under_review_application.pk})
        response = applicant_client.post(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN


# Reviewer Permission Tests
# ==============================================================================


@pytest.mark.django_db
class TestReviewerPermissions:
    """Tests the permissions for a user with the 'reviewer' role."""

    def test_reviewer_cannot_create_application(
        self, reviewer_client: APIClient
    ) -> None:
        url = reverse("application-list")
        data = {"title": "New App by Reviewer", "category": "general"}
        response = reviewer_client.post(url, data)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_reviewer_can_list_all_applications(
        self,
        reviewer_client: APIClient,
        draft_application: application_models.Application,
        other_application: application_models.Application,
    ) -> None:
        url = reverse("application-list")
        response = reviewer_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 2

    def test_reviewer_can_retrieve_any_application(
        self,
        reviewer_client: APIClient,
        draft_application: application_models.Application,
    ) -> None:
        url = reverse("application-detail", kwargs={"pk": draft_application.pk})
        response = reviewer_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == draft_application.id

    def test_reviewer_can_start_review(
        self,
        reviewer_client: APIClient,
        submitted_application: application_models.Application,
    ) -> None:
        url = reverse(
            "application-start-review", kwargs={"pk": submitted_application.pk}
        )
        response = reviewer_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == application_models.Application.UNDER_REVIEW

    def test_reviewer_cannot_submit_application(
        self,
        reviewer_client: APIClient,
        draft_application: application_models.Application,
    ) -> None:
        url = reverse("application-submit", kwargs={"pk": draft_application.pk})
        response = reviewer_client.post(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_reviewer_can_approve_application(
        self,
        reviewer_client: APIClient,
        under_review_application: application_models.Application,
    ) -> None:
        url = reverse("application-approve", kwargs={"pk": under_review_application.pk})
        response = reviewer_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == application_models.Application.APPROVED

    def test_reviewer_can_reject_with_comment(
        self,
        reviewer_client: APIClient,
        under_review_application: application_models.Application,
    ) -> None:
        url = reverse("application-reject", kwargs={"pk": under_review_application.pk})
        response = reviewer_client.post(url, data={"comment": "Not sufficient."})
        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == application_models.Application.REJECTED

    def test_reviewer_cannot_reject_without_comment(
        self,
        reviewer_client: APIClient,
        under_review_application: application_models.Application,
    ) -> None:
        url = reverse("application-reject", kwargs={"pk": under_review_application.pk})
        response = reviewer_client.post(url, data={})
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_reviewer_can_return_for_changes_with_comment(
        self,
        reviewer_client: APIClient,
        under_review_application: application_models.Application,
    ) -> None:
        url = reverse(
            "application-return-for-changes", kwargs={"pk": under_review_application.pk}
        )
        response = reviewer_client.post(url, data={"comment": "Please revise."})
        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == application_models.Application.DRAFT

    def test_reviewer_cannot_return_without_comment(
        self,
        reviewer_client: APIClient,
        under_review_application: application_models.Application,
    ) -> None:
        url = reverse(
            "application-return-for-changes", kwargs={"pk": under_review_application.pk}
        )
        response = reviewer_client.post(url, data={})
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_audit_log_written_on_transition(
        self,
        reviewer_client: APIClient,
        under_review_application: application_models.Application,
    ) -> None:
        approve_url = reverse(
            "application-approve", kwargs={"pk": under_review_application.pk}
        )
        reviewer_client.post(approve_url)

        audit_url = reverse(
            "application-audit-log", kwargs={"pk": under_review_application.pk}
        )
        response = reviewer_client.get(audit_url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) > 0
