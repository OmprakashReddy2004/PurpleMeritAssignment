import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from users.models import User

pytestmark = pytest.mark.django_db


def make_user(email="user@example.com", password="Test@1234", role="user", is_active=True):
    u = User.objects.create_user(
        email=email,
        full_name="Test User",
        password=password,
    )
    u.role = role
    u.is_active = is_active
    u.save()
    return u


def auth_client(user: User):
    client = APIClient()
    # login to get access token
    resp = client.post("/api/auth/login", {"email": user.email, "password": "Test@1234"}, format="json")
    assert resp.status_code == 200
    token = resp.data["tokens"]["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return client


def test_signup_success_returns_tokens():
    client = APIClient()
    resp = client.post(
        "/api/auth/signup/",
        {
            "full_name": "New User",
            "email": "new@example.com",
            "password": "Test@1234",
            "confirm_password": "Test@1234",
        },
        format="json",
    )
    assert resp.status_code == 201
    assert "tokens" in resp.data
    assert "access" in resp.data["tokens"]
    assert resp.data["user"]["email"] == "new@example.com"


def test_login_fails_for_inactive_user():
    make_user(email="inactive@example.com", is_active=False)
    client = APIClient()
    resp = client.post(
        "/api/auth/login",
        {"email": "inactive@example.com", "password": "Test@1234"},
        format="json",
    )
    assert resp.status_code == 400
    # your API wraps errors under "error"
    assert "error" in resp.data


def test_me_requires_auth():
    client = APIClient()
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401


def test_non_admin_cannot_list_users():
    user = make_user(email="normal@example.com", role="user")
    client = auth_client(user)
    resp = client.get("/api/admin/users?page=1")
    assert resp.status_code in (403, 401)


def test_admin_can_list_users():
    admin = make_user(email="admin@example.com", role="admin")
    client = auth_client(admin)
    resp = client.get("/api/admin/users?page=1")
    assert resp.status_code == 200
    assert "results" in resp.data
