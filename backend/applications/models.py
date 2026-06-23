import django_fsm
from django_fsm import transition
from django.db import models
from django.conf import settings


class Application(models.Model):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"

    STATUS_CHOICES = [
        (DRAFT, "Draft"),
        (SUBMITTED, "Submitted"),
        (UNDER_REVIEW, "Under Review"),
        (APPROVED, "Approved"),
        (REJECTED, "Rejected"),
    ]

    CATEGORY_CHOICES = [
        ("general", "General Request"),
        ("budget", "Budget Approval"),
        ("leave", "Leave Request"),
        ("procurement", "Procurement"),
        ("other", "Other"),
    ]

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="applications",
    )
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    amount = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )

    # protected=True prevents any direct assignment to status
    status = django_fsm.FSMField(default=DRAFT, choices=STATUS_CHOICES, protected=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} [{self.status}]"

    # Transitions                                                #
    @transition(field=status, source=DRAFT, target=SUBMITTED)
    def submit(self):
        pass

    @transition(field=status, source=SUBMITTED, target=UNDER_REVIEW)
    def start_review(self):
        pass

    @transition(field=status, source=UNDER_REVIEW, target=APPROVED)
    def approve(self):
        pass

    @transition(field=status, source=UNDER_REVIEW, target=REJECTED)
    def reject(self):
        pass

    @transition(field=status, source=UNDER_REVIEW, target=DRAFT)
    def return_for_changes(self):
        pass


class AuditLog(models.Model):
    """
    Append-only. Every status transition writes one row here.
    Never updated or deleted after creation.
    """
    application = models.ForeignKey(
        Application,
        on_delete=models.CASCADE,
        related_name="audit_logs",
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="audit_actions",
    )
    from_status = models.CharField(max_length=50)
    to_status = models.CharField(max_length=50)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.application} | {self.from_status} → {self.to_status} by {self.actor}"
