import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from django.utils.timezone import now
from datetime import timedelta
from django.contrib.auth import get_user_model

from tasks.models import Task, Category

User = get_user_model()

@pytest.fixture
def user(db):
    return User.objects.create_user(email="user1@example.com", password="password123")

@pytest.fixture
def another_user(db):
    return User.objects.create_user(email="user2@example.com", password="password123")

@pytest.fixture
def api_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client

@pytest.fixture
def category(user):
    return Category.objects.create(name="Work", user=user, color="#FF5733")

@pytest.mark.django_db
def test_category_crud(api_client, user):
    api_client.force_authenticate(user=user)
    url = reverse("categories-list")

    response = api_client.post(url, {"name": "Home", "color": "#123456"})
    assert response.status_code == 201
    data = response.json()
    cat_id = data["id"]

    response = api_client.get(url)
    assert response.status_code == 200
    data = response.json()
    assert any(c["id"] == cat_id for c in  data["results"])

    response = api_client.patch(reverse("categories-detail", args=[cat_id]), {"color": "#654321"})
    data = response.json()
    assert response.status_code == 200
    assert data["color"] == "#654321"

    response = api_client.delete(reverse("categories-detail", args=[cat_id]))
    assert response.status_code == 204

@pytest.mark.django_db
def test_task_crud_permissions(api_client, user, another_user, category):
    url = reverse("tasks-list")

    response = api_client.post(url, {
        "title": "Shared Task",
        "description": "Desc",
        "category": category.id,
        "shares": [{"email": another_user.email, "can_edit": True}],
        "due_date": (now()+timedelta(days=1)).isoformat()
    }, format="json")
    task_id = response.data["id"]

    response = api_client.patch(reverse("tasks-detail", args=[task_id]), {"title": "Updated Task"}, format="json")
    assert response.status_code == 200

    client2 = APIClient()
    client2.force_authenticate(another_user)
    response = client2.patch(reverse("tasks-detail", args=[task_id]), {"title": "Edited by Share"}, format="json")
    assert response.status_code == 200

    client3 = APIClient()
    response = client3.get(reverse("tasks-list"))
    assert response.status_code == 401

@pytest.mark.django_db
def test_task_completion_logic(api_client, user, category):
    task = Task.objects.create(title="Incomplete", owner=user, category=category)
    url = reverse("tasks-detail", args=[task.id])

    response = api_client.patch(url, {"is_completed": True}, format="json")
    task.refresh_from_db()
    assert task.is_completed
    assert task.completed_by == user
    assert task.completed_at is not None

    response = api_client.patch(url, {"is_completed": False}, format="json")
    task.refresh_from_db()
    assert not task.is_completed
    assert task.completed_by == user