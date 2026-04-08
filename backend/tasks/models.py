from django.db import models
from django.core.validators import RegexValidator
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

color_validator = RegexValidator(
    regex=r"^#(?:[0-9a-fA-F]{3}){1,2}$",
    message="Enter a valid hex color code"
)

class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    name = models.CharField(max_length=100)

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="categories"
    )

    color = models.CharField(
        max_length=7,
        validators=[color_validator],
        default="#FFFFFF",
        help_text="Hex color code (e.g. #FF5733)"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("name", "user")

    def __str__(self):
        return self.name

class TaskQuerySet(models.QuerySet):
    def alive(self):
        return self.filter(is_deleted=False)

    def deleted(self):
        return self.filter(is_deleted=True)


class TaskManager(models.Manager):
    def get_queryset(self):
        return TaskQuerySet(self.model, using=self._db).alive()


class Task(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="owned_tasks"
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tasks"
    )

    is_completed = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)

    due_date = models.DateTimeField(null=True, blank=True)

    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+"
    )

    completed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="completed_tasks"
    )

    completed_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TaskManager()          # hides deleted by default
    all_objects = models.Manager()

    class Meta:
        ordering = ["-due_date", "-created_at"]


    def __str__(self):
        return f"{self.title} ({self.owner})"

class TaskShare(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    task = models.ForeignKey(
        "Task",
        on_delete=models.CASCADE,
        related_name="shares"
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="task_shares"
    )

    can_edit = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("task", "user")

    def __str__(self):
        return f"{self.user} -> {self.task} (edit={self.can_edit})"