from django.urls import path

from .views import (AdminActivateUserView, AdminDeactivateUserView,
                    AdminUserListView, ChangePasswordView, LoginView,
                    LogoutView, MeView, SignupView, UserProfileView)

urlpatterns = [
    # Auth
    path("auth/signup/", SignupView.as_view(), name="signup"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),

    # User
    path("users/me/", UserProfileView.as_view(), name="user-profile"),
    path("users/change-password/", ChangePasswordView.as_view(), name="change-password"),

    # Admin
    path("admin/users/", AdminUserListView.as_view(), name="admin-users"),
    path("admin/users/<int:user_id>/activate/", AdminActivateUserView.as_view(), name="admin-activate-user"),
    path("admin/users/<int:user_id>/deactivate/", AdminDeactivateUserView.as_view(), name="admin-deactivate-user"),
]
