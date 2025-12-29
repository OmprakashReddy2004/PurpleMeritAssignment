from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import LoginSerializer, SignupSerializer, UserSerializer


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


class SignupView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()
        tokens = get_tokens_for_user(user)

        return Response(
            {
                "message": "Signup successful",
                "tokens": tokens,
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.validated_data["user"]
        user.last_login = timezone.now()
        user.save(update_fields=["last_login"])

        tokens = get_tokens_for_user(user)
        
        return Response(
            {
                "message": "Login successful",
                "tokens": tokens,
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class MeView(APIView):
    def get(self, request):
        return Response({"user": UserSerializer(request.user).data}, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    JWT is stateless. "Logout" on the backend typically means blacklisting refresh tokens.
    For now: accept refresh token and blacklist it if blacklist app is enabled.
    If blacklist isn't enabled, frontend can just delete tokens.
    """

    def post(self, request):
        refresh = request.data.get("refresh")
        if not refresh:
            return Response({"error": "refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh)
            token.blacklist()  # works only if blacklist app is enabled
            return Response({"message": "Logged out"}, status=status.HTTP_200_OK)
        except Exception:
            # If blacklist isn't enabled or token invalid
            return Response({"message": "Logged out"}, status=status.HTTP_200_OK)

from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination

from .models import User
from .permissions import IsAdmin


class AdminUserListView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        qs = User.objects.all().order_by("-created_at")

        paginator = PageNumberPagination()
        paginator.page_size = 10
        page = paginator.paginate_queryset(qs, request)

        data = UserSerializer(page, many=True).data
        return paginator.get_paginated_response(data)


class AdminActivateUserView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, user_id):
        if request.user.id == user_id:
            return Response({"error": "You cannot activate/deactivate yourself"}, status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(User, id=user_id)
        user.is_active = True
        user.save(update_fields=["is_active"])

        return Response({"message": "User activated"}, status=status.HTTP_200_OK)


class AdminDeactivateUserView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, user_id):
        if request.user.id == user_id:
            return Response({"error": "You cannot activate/deactivate yourself"}, status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(User, id=user_id)
        user.is_active = False
        user.save(update_fields=["is_active"])

        return Response({"message": "User deactivated"}, status=status.HTTP_200_OK)

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from .serializers import UserSerializer


class UserProfileView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user
        full_name = request.data.get("full_name", user.full_name)
        email = request.data.get("email", user.email)

        # basic update (serializer validation is better if you already have it)
        user.full_name = full_name
        user.email = email
        user.save(update_fields=["full_name", "email", "updated_at"])

        return Response(
            {"message": "Profile updated", "user": UserSerializer(user).data},
            status=status.HTTP_200_OK,
        )


class ChangePasswordView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")
        confirm_new_password = request.data.get("confirm_new_password")

        if not old_password or not new_password or not confirm_new_password:
            return Response(
                {"error": "All password fields are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if new_password != confirm_new_password:
            return Response(
                {"error": "New passwords do not match"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.check_password(old_password):
            return Response(
                {"error": "Old password is incorrect"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save(update_fields=["password", "updated_at"])

        return Response(
            {"message": "Password updated successfully"},
            status=status.HTTP_200_OK,
        )

