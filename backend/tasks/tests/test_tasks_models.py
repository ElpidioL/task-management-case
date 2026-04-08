import pytest
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from datetime import datetime, timedelta

from tasks.models import Category, Task, TaskShare

User = get_user_model()

@pytest.fixture
def user(db):
    return User.objects.create_user(email="testuser@gmail.com", password="password123")

@pytest.fixture
def another_user(db):
    return User.objects.create_user(email="otheruser@gmail.com", password="password123")

@pytest.fixture
def category(user):
    return Category.objects.create(name="Work", user=user, color="#FF5733")

@pytest.mark.django_db
def test_category_creation(category, user):
    assert category.name == "Work"
    assert category.user == user
    assert category.color == "#FF5733"
    assert str(category) == "Work"

@pytest.mark.django_db
def test_category_unique_constraint(user):
    Category.objects.create(name="Home", user=user)
    with pytest.raises(IntegrityError):
        Category.objects.create(name="Home", user=user)

@pytest.mark.django_db
def test_category_color_validation(user):
    cat = Category(name="Test", user=user, color="invalid")
    with pytest.raises(ValidationError):
        cat.full_clean()

@pytest.mark.django_db
def test_task_creation(user, category):
    task = Task.objects.create(
        title="Finish report",
        owner=user,
        category=category,
        due_date=datetime.now() + timedelta(days=1)
    )
    assert task.title == "Finish report"
    assert task.owner == user
    assert task.category == category
    assert not task.is_completed
    assert not task.is_deleted
    assert str(task) == f"Finish report ({user})"

@pytest.mark.django_db
def test_task_soft_delete(user):
    task = Task.objects.create(title="Delete me", owner=user)
    task.is_deleted = True
    task.save()


    assert Task.objects.filter(id=task.id).count() == 0

    assert Task.all_objects.filter(id=task.id).count() == 1

@pytest.mark.django_db
def test_taskshare_creation(user, another_user, category):
    task = Task.objects.create(title="Shared Task", owner=user)
    share = TaskShare.objects.create(task=task, user=another_user, can_edit=True)
    assert share.task == task
    assert share.user == another_user
    assert share.can_edit
    assert str(share) == f"{another_user} -> {task} (edit=True)"

@pytest.mark.django_db
def test_taskshare_unique_constraint(user, another_user):
    task = Task.objects.create(title="Unique Task", owner=user)
    TaskShare.objects.create(task=task, user=another_user)
    with pytest.raises(IntegrityError):
        TaskShare.objects.create(task=task, user=another_user)