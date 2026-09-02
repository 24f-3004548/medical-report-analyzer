import os
from urllib import response

from fastapi import APIRouter, Depends, HTTPException

from app.models.user import (
    RegisterRequest,
    LoginRequest,
    UpdateProfileRequest,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from app.services.supabase import supabase
from app.services.auth import get_current_user


auth_router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

profile_router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)


def serialize_profile(profile: dict) -> dict:
    """Keep database field names internal and expose a consistent API shape."""
    return {
        "id": profile["id"],
        "email": profile["email"],
        "fullName": profile.get("name", ""),  # Legacy database column.
        "dateOfBirth": profile.get("dateofbirth") or "",  # Legacy database column.
        "gender": profile.get("gender", ""),
    }


# ============================================================
# REGISTER
# ============================================================

@auth_router.post("/register")
def register(data: RegisterRequest):

    try:
        response = supabase.auth.sign_up({
            "email": data.email,
            "password": data.password,
        })
        print("SIGNUP USER:", response.user)
        print("SIGNUP USER ID:", response.user.id if response.user else None)
        print("SIGNUP SESSION:", response.session)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Could not create account: {str(e)}"
        )

    if not response.user:
        raise HTTPException(
            status_code=400,
            detail="Could not create account."
        )

    user = response.user

    # Supabase returns an obfuscated user with no identities when sign-up is
    # attempted with an email that already belongs to an account.
    if user.identities == []:
        raise HTTPException(
            status_code=409,
            detail="Account already exists."
        )

    profile = {
        "id": user.id,
        "name": data.full_name,
        "email": data.email,
        "dateofbirth": data.date_of_birth.isoformat(),
        "gender": data.gender,
    }

    try:
        supabase.table("users").insert(profile).execute()
    except Exception as e:
        error_message = str(e).lower()
        if "duplicate key" in error_message or "unique constraint" in error_message:
            raise HTTPException(
                status_code=409,
                detail="Account already exists."
            )
        raise HTTPException(
            status_code=500,
            detail="Account created but profile could not be saved."
        )

    return {
        "message": "Account created successfully.",
        "token": (
            response.session.access_token
            if response.session
            else None
        ),
        "user": serialize_profile(profile),
        "session": (
            response.session.model_dump()
            if response.session
            else None
        ),
    }


# ============================================================
# LOGIN
# ============================================================

@auth_router.post("/login")
def login(data: LoginRequest):

    try:
        response = supabase.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password,
        })
    except Exception as error:
        status_code = getattr(error, "status", None) or getattr(error, "status_code", None)
        error_message = str(error).lower()
        if "email not confirmed" in error_message or "email_not_confirmed" in error_message:
            raise HTTPException(
                status_code=403,
                detail="Please check your inbox and confirm your email before signing in."
            )
        if status_code in {400, 401}:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password."
            )
        print(f"Login service error: {error}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error."
        )

    if not response.user or not response.session:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    try:
        profile_response = (
            supabase
            .table("users")
            .select("*")
            .eq("id", response.user.id)
            .single()
            .execute()
        )

        user_profile = (
            profile_response.data
            if profile_response.data
            else {}
        )

    except Exception as error:
        print(f"Profile lookup error during login: {error}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error."
        )

    return {
        "message": "Login successful.",
        "token": response.session.access_token,
        "user": serialize_profile({
            **user_profile,
            "id": response.user.id,
            "email": response.user.email,
        }),
        "session": response.session.model_dump(),
    }


# ============================================================
# LOGOUT
# ============================================================

@auth_router.post("/logout")
def logout(user=Depends(get_current_user)):

    return {
        "message": "Logged out successfully."
    }


# ============================================================
# FORGOT PASSWORD
# ============================================================

@auth_router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest):

    try:
        frontend_url = os.getenv("FRONTEND_URL", "https://veris-medical.vercel.app")

        supabase.auth.reset_password_for_email(
            data.email,
            {
                "redirect_to": f"{frontend_url.rstrip('/')}/reset-password"
            }
        )

        return {
            "message": (
                "If an account exists with that email, "
                "a password reset link will be sent."
            )
        }

    except Exception as e:

        print(f"Password reset error: {str(e)}")

        raise HTTPException(
            status_code=500,
            detail="Internal server error."
        )


# ============================================================
# RESET PASSWORD
# ============================================================

@auth_router.post("/reset-password")
def reset_password(
    data: ResetPasswordRequest,
    user=Depends(get_current_user)
):

    try:
        supabase.auth.admin.update_user_by_id(
            user.id,
            {
                "password": data.password
            }
        )

        return {
            "message": "Password reset successfully."
        }

    except HTTPException:
        raise

    except Exception as e:

        print(f"Reset password error: {str(e)}")

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid or expired reset token. "
                "Please request a new password reset link."
            )
        )


# ============================================================
# CHANGE PASSWORD
# ============================================================

@auth_router.post("/change-password")
def change_password(
    data: ChangePasswordRequest,
    user=Depends(get_current_user)
):

    try:

        supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": data.currentPassword,
        })

    except Exception:

        raise HTTPException(
            status_code=401,
            detail="Current password is incorrect."
        )

    try:

        supabase.auth.admin.update_user_by_id(
            user.id,
            {
                "password": data.newPassword
            }
        )

        return {
            "message": "Password updated successfully."
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to update password: {str(e)}"
        )


# ============================================================
# GET PROFILE
# ============================================================

@profile_router.get("")
def get_profile(user=Depends(get_current_user)):

    try:

        response = (
            supabase
            .table("users")
            .select("*")
            .eq("id", user.id)
            .single()
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Profile not found."
            )

        return serialize_profile(response.data)

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch profile: {str(e)}"
        )


# ============================================================
# UPDATE PROFILE
# ============================================================

@profile_router.patch("")
def update_profile(
    data: UpdateProfileRequest,
    user=Depends(get_current_user)
):

    update_data = {}

    if data.full_name is not None:
        update_data["name"] = data.full_name

    if data.date_of_birth is not None:
        update_data["dateofbirth"] = data.date_of_birth.isoformat()

    if data.gender is not None:
        update_data["gender"] = data.gender

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields to update."
        )

    try:

        response = (
            supabase
            .table("users")
            .update(update_data)
            .eq("id", user.id)
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Profile not found."
            )

        return serialize_profile(response.data[0])

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to update profile: {str(e)}"
        )


# ============================================================
# DELETE ACCOUNT
# ============================================================

@profile_router.delete("")
def delete_account(user=Depends(get_current_user)):

    try:

        supabase \
            .table("users") \
            .delete() \
            .eq("id", user.id) \
            .execute()

        supabase.auth.admin.delete_user(user.id)

        return {
            "message": "Account deleted successfully."
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete account: {str(e)}"
        )
