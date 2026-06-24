from django.contrib.auth import models as dj_auth_models
from django.db import models


class User(dj_auth_models.AbstractUser):
    """Custom user model with applicant/reviewer roles."""

    ROLE_APPLICANT = "applicant"
    ROLE_REVIEWER = "reviewer"

    ROLE_CHOICES = [
        (ROLE_APPLICANT, "Applicant"),
        (ROLE_REVIEWER, "Reviewer"),
    ]

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default=ROLE_APPLICANT,
    )

    def __str__(self) -> str:
        return f"{self.username} ({self.role})"

    @property
    def is_applicant(self) -> bool:
        """Checks if the user has the 'applicant' role.

        Returns:
            bool: True if the user is an applicant, False otherwise.
        """
        return self.role == self.ROLE_APPLICANT

    @property
    def is_reviewer(self) -> bool:
        """Checks if the user has the 'reviewer' role.

        Returns:
            bool: True if the user is a reviewer, False otherwise.
        """
        return self.role == self.ROLE_REVIEWER
