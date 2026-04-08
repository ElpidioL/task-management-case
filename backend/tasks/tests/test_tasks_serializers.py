import pytest
from rest_framework.serializers import ValidationError
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta
from django.utils import timezone

from tasks.models import Category, Task, TaskShare
from tasks.serializers import CategorySerializer, TaskSerializer, TaskShareSerializer

User = get_user_model()

@pytest.fixture
def user(db):
    return User.objects.create_user(email="user@example.com", password="password123")

@pytest.fixture
def another_user(db):
    return User.objects.create_user(email="other@example.com", password="password123")

@pytest.fixture
def category(user):
    return Category.objects.create(name="Work", user=user, color="#FF5733")

@pytest.fixture
def task(user, category):
    """Return a Task instance for testing."""
    return Task.objects.create(
        title="Test Task",
        description="A test task",
        owner=user,
        category=category,
    )

@pytest.mark.django_db
def test_category_serializer_creation(user):
    data = {"name": "Work", "color": "#FF5733"}
    serializer = CategorySerializer(data=data)
    assert serializer.is_valid(), serializer.errors
    category = serializer.save(user=user)
    assert category.name == "Work"
    assert category.color == "#FF5733"
    assert serializer.data["name"] == "Work"
    assert serializer.data["color"] == "#FF5733"

@pytest.mark.django_db
def test_taskshare_serializer_validation(user, another_user, task):
    data = {"email": another_user.email, "can_edit": True}
    serializer = TaskShareSerializer(data=data, context={"task": task})
    assert serializer.is_valid(), serializer.errors
    share = serializer.save()
    assert share.user == another_user
    assert share.task == task
    assert share.can_edit is True

    invalid_data = {"email": "notfound@example.com", "can_edit": False}
    serializer = TaskShareSerializer(data=invalid_data, context={"task": task})
    with pytest.raises(ValidationError):
        serializer.is_valid(raise_exception=True)

@pytest.mark.django_db
def test_task_serializer_creation_with_shares(user, another_user, db):
    category = Category.objects.create(name="Work", user=user, color="#FF5733")

    data = {
        "title": "Finish report",
        "description": "Important report",
        "category": category.id,
        "shares": [
            {"email": another_user.email, "can_edit": True}
        ],
        "due_date": (timezone.now() + timedelta(days=1)).isoformat()
    }

    serializer = TaskSerializer(data=data)
    assert serializer.is_valid(), serializer.errors
    task = serializer.save(owner=user)
    assert task.title == "Finish report"
    assert task.owner == user
    assert task.shares.count() == 1
    share = task.shares.first()
    assert share.user == another_user
    assert share.can_edit is True

@pytest.mark.django_db
def test_task_serializer_update_shares(user, another_user, db):
    category = Category.objects.create(name="Work", user=user, color="#FF5733")
    task = Task.objects.create(title="Old Task", owner=user, category=category)

    TaskShare.objects.create(task=task, user=another_user, can_edit=False)

    update_data = {
        "title": "Updated Task",
        "shares": [
            {"email": another_user.email, "can_edit": True}  # replace old share
        ]
    }

    serializer = TaskSerializer(task, data=update_data, partial=True)
    assert serializer.is_valid(), serializer.errors
    task = serializer.save()
    assert task.title == "Updated Task"
    assert task.shares.count() == 1
    share = task.shares.first()
    assert share.can_edit is True