import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from accounts.models import CustomUser

@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
def test_register_view(api_client):
    url = reverse("register")
    data = {
        "email": "test@example.com",
        "password1": "StrongPassword123!",
        "password2": "StrongPassword123!"
    }

    response = api_client.post(url, data, format="json")
    assert response.status_code == status.HTTP_201_CREATED
    assert CustomUser.objects.filter(email=data["email"]).exists()


@pytest.mark.django_db
def test_register_duplicate_email(api_client):
    CustomUser.objects.create_user(email="test@example.com", password="SomePassword123!")
    url = reverse("register")
    data = {
        "email": "test@example.com",
        "password1": "StrongPassword123!",
        "password2": "StrongPassword123!"
    }

    response = api_client.post(url, data, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "email" in response.data


@pytest.mark.django_db
def test_login_sets_cookies(api_client):
    user = CustomUser.objects.create_user(email="test@example.com", password="StrongPassword123!")
    url = reverse("token_obtain_pair")

    response = api_client.post(
        url,
        {"email": "test@example.com", "password": "StrongPassword123!"},
        format="json"
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.data["detail"] == "Login successful"

    cookies = response.cookies
    assert "access" in cookies
    assert "refresh" in cookies
    assert cookies["access"]["httponly"]
    assert cookies["refresh"]["httponly"]


@pytest.mark.django_db
def test_refresh_token(api_client):
    user = CustomUser.objects.create_user(email="test@example.com", password="StrongPassword123!")
    login_url = reverse("token_obtain_pair")
    refresh_url = reverse("token_refresh")

    login_resp = api_client.post(
        login_url,
        {"email": "test@example.com", "password": "StrongPassword123!"},
        format="json"
    )

    refresh_cookie = login_resp.cookies["refresh"].value

    api_client.cookies["refresh"] = refresh_cookie

    response = api_client.post(refresh_url, format="json")
    assert response.status_code == status.HTTP_200_OK
    assert response.data["detail"] == "Token refreshed successfully"

    assert "access" in response.cookies
    assert response.cookies["access"]["httponly"]


@pytest.mark.django_db
def test_refresh_token_missing_cookie(api_client):
    url = reverse("token_refresh")
    response = api_client.post(url, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data["detail"] == "No refresh token"


@pytest.mark.django_db
def test_refresh_token_invalid_cookie(api_client):
    url = reverse("token_refresh")
    api_client.cookies["refresh"] = "invalidtoken"
    response = api_client.post(url, format="json")
    assert response.status_code == 401
    assert response.data["detail"] == "Invalid refresh token"