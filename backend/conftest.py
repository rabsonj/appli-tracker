import pytest
from applications import models as application_models
from users import models as user_models


@pytest.fixture
def applicant(db: None) -> user_models.User:
    return user_models.User.objects.create_user(
        username="applicant",
        password="applicant123",
        role=user_models.User.ROLE_APPLICANT,
        email="applicant@test.com",
    )


@pytest.fixture
def reviewer(db: None) -> user_models.User:
    return user_models.User.objects.create_user(
        username="reviewer",
        password="reviewer123",
        role=user_models.User.ROLE_REVIEWER,
        email="reviewer@test.com",
    )


@pytest.fixture
def draft_application(db: None, applicant: user_models.User) -> application_models.Application:
    return application_models.Application.objects.create(
        owner=applicant,
        title="Test application_models.Application",
        category="general",
        description="A test application",
        amount="100.00",
    )


@pytest.fixture
def submitted_application(draft_application: application_models.Application) -> application_models.Application:
    draft_application.submit()
    draft_application.save()
    return draft_application


@pytest.fixture
def under_review_application(submitted_application: application_models.Application) -> application_models.Application:
    submitted_application.start_review()
    submitted_application.save()
    return submitted_application