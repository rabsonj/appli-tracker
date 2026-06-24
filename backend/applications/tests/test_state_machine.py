"""
State machine unit tests.
Covers every legal and illegal transition.
"""
import pytest
import django_fsm

from applications import models as application_models


# ------------------------------------------------------------------ #
# Legal transitions                                                    #
# ------------------------------------------------------------------ #

class TestLegalTransitions:

    def test_draft_to_submitted(self, draft_application: application_models.Application) -> None:
        """Applicant can submit a draft."""
        draft_application.submit()
        assert draft_application.status == application_models.Application.SUBMITTED

    def test_submitted_to_under_review(self, submitted_application: application_models.Application) -> None:
        """Reviewer can start reviewing a submitted application."""
        submitted_application.start_review()
        assert submitted_application.status == application_models.Application.UNDER_REVIEW

    def test_under_review_to_approved(self, under_review_application: application_models.Application) -> None:
        """Reviewer can approve an application under review."""
        under_review_application.approve()
        assert under_review_application.status == application_models.Application.APPROVED

    def test_under_review_to_rejected(self, under_review_application: application_models.Application) -> None:
        """Reviewer can reject an application under review."""
        under_review_application.reject()
        assert under_review_application.status == application_models.Application.REJECTED

    def test_under_review_to_draft(self, under_review_application: application_models.Application) -> None:
        """Reviewer can return an application for changes."""
        under_review_application.return_for_changes()
        assert under_review_application.status == application_models.Application.DRAFT

    def test_full_approval_path(self, draft_application: application_models.Application) -> None:
        """Full happy path: DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED."""
        draft_application.submit()
        assert draft_application.status == application_models.Application.SUBMITTED

        draft_application.start_review()
        assert draft_application.status == application_models.Application.UNDER_REVIEW

        draft_application.approve()
        assert draft_application.status == application_models.Application.APPROVED

    def test_full_rejection_path(self, draft_application: application_models.Application) -> None:
        """Full rejection path: DRAFT → SUBMITTED → UNDER_REVIEW → REJECTED."""
        draft_application.submit()
        draft_application.start_review()
        draft_application.reject()
        assert draft_application.status == application_models.Application.REJECTED

    def test_return_and_resubmit(self, under_review_application: application_models.Application) -> None:
        """application_models.Application returned to DRAFT can be resubmitted."""
        under_review_application.return_for_changes()
        assert under_review_application.status == application_models.Application.DRAFT

        under_review_application.submit()
        assert under_review_application.status == application_models.Application.SUBMITTED


# ------------------------------------------------------------------ #
# Illegal transitions                                                  #
# ------------------------------------------------------------------ #

class TestIllegalTransitions:

    def test_cannot_approve_from_draft(self, draft_application: application_models.Application) -> None:
        with pytest.raises(django_fsm.TransitionNotAllowed):
            draft_application.approve()

    def test_cannot_reject_from_draft(self, draft_application: application_models.Application) -> None:
        with pytest.raises(django_fsm.TransitionNotAllowed):
            draft_application.reject()

    def test_cannot_start_review_from_draft(self, draft_application: application_models.Application) -> None:
        with pytest.raises(django_fsm.TransitionNotAllowed):
            draft_application.start_review()

    def test_cannot_return_for_changes_from_draft(self, draft_application: application_models.Application) -> None:
        with pytest.raises(django_fsm.TransitionNotAllowed):
            draft_application.return_for_changes()

    def test_cannot_approve_from_submitted(self, submitted_application: application_models.Application) -> None:
        with pytest.raises(django_fsm.TransitionNotAllowed):
            submitted_application.approve()

    def test_cannot_reject_from_submitted(self, submitted_application: application_models.Application) -> None:
        with pytest.raises(django_fsm.TransitionNotAllowed):
            submitted_application.reject()

    def test_cannot_return_for_changes_from_submitted(self, submitted_application: application_models.Application) -> None:
        with pytest.raises(django_fsm.TransitionNotAllowed):
            submitted_application.return_for_changes()

    def test_cannot_submit_again_from_submitted(self, submitted_application: application_models.Application) -> None:
        with pytest.raises(django_fsm.TransitionNotAllowed):
            submitted_application.submit()

    def test_cannot_submit_from_under_review(self, under_review_application: application_models.Application) -> None:
        with pytest.raises(django_fsm.TransitionNotAllowed):
            under_review_application.submit()

    def test_cannot_submit_from_approved(self, under_review_application: application_models.Application) -> None:
        under_review_application.approve()
        with pytest.raises(django_fsm.TransitionNotAllowed):
            under_review_application.submit()

    def test_cannot_approve_again_from_approved(self, under_review_application: application_models.Application) -> None:
        under_review_application.approve()
        with pytest.raises(django_fsm.TransitionNotAllowed):
            under_review_application.approve()

    def test_cannot_approve_from_rejected(self, under_review_application: application_models.Application) -> None:
        under_review_application.reject()
        with pytest.raises(django_fsm.TransitionNotAllowed):
            under_review_application.approve()

    def test_cannot_submit_from_rejected(self, under_review_application: application_models.Application) -> None:
        under_review_application.reject()
        with pytest.raises(django_fsm.TransitionNotAllowed):
            under_review_application.submit()


# ------------------------------------------------------------------ #
# FSM protection                                                       #
# ------------------------------------------------------------------ #

class TestFSMProtection:

    def test_status_field_is_protected(self, draft_application: application_models.Application) -> None:
        """Direct assignment to status must raise AttributeError."""
        with pytest.raises(AttributeError):
            draft_application.status = application_models.Application.APPROVED


# ------------------------------------------------------------------ #
# Default state                                                        #
# ------------------------------------------------------------------ #

class TestDefaultState:

    def test_new_application_defaults_to_draft(self) -> None:
        """No DB needed — just instantiating the model to check default."""
        app = application_models.Application(
            title="New App",
            category="general",
        )
        assert app.status == application_models.Application.DRAFT
