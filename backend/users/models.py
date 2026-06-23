from django.contrib.auth import models as dj_auth_models
from django.db import models


class User(dj_auth_models.AbstractUser):
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

    def __str__(self):
        return f"{self.username} ({self.role})"

    @property
    def is_applicant(self):
        return self.role == self.ROLE_APPLICANT

    @property
    def is_reviewer(self):
        return self.role == self.ROLE_REVIEWER
