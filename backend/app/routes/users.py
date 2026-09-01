from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field

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


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    dob: date
    gender: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UpdateProfileRequest(BaseModel):
    fullName: str | None = None
    dateOfBirth: str | None = None
    gender: str | None = None


class ChangePasswordRequest(BaseModel):
    currentPassword: str
    newPassword: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    token: str
    password: str


@auth_router.post("/register")
def register(data: RegisterRequest):

    # 1. Create Supabase Auth user
    response = supabase.auth.sign_up({
        "email": data.email,
        "password": data.password,
    })

    if not response.user:
        raise HTTPException(
            status_code=400,
            detail="Could not create account."
        )

    user = response.user

    # 2. Create user profile
    profile = {
        "id": user.id,
        "fullName": data.name,
        "email": data.email,
        "dateOfBirth": data.dob.isoformat() if isinstance(data.dob, date) else data.dob,
        "gender": data.gender,
    }

    try:
        supabase.table("users").insert(profile).execute()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Account created but profile could not be saved: {str(e)}"
        )

    # 3. Return session information
    return {
        "message": "Account created successfully.",
        "token": response.session.access_token if response.session else None,
        "user": {
            "id": user.id,
            "email": user.email,
            "fullName": data.name,
            "dateOfBirth": data.dob.isoformat() if isinstance(data.dob, date) else data.dob,
            "gender": data.gender,
        },
        "session": response.session.model_dump() if response.session else None,
    }


@auth_router.post("/login")
def login(data: LoginRequest):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password,
        })
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    if not response.user or not response.session:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    # Fetch full user profile
    try:
        profile_response = supabase.table("users").select("*").eq("id", response.user.id).single().execute()
        user_profile = profile_response.data if profile_response.data else {}
    except:
        user_profile = {}

    return {
        "message": "Login successful.",
        "token": response.session.access_token,
        "user": {
            "id": response.user.id,
            "email": response.user.email,
            "fullName": user_profile.get("fullName", ""),
            "dateOfBirth": user_profile.get("dateOfBirth", ""),
            "gender": user_profile.get("gender", ""),
        },
        "session": response.session.model_dump(),
    }


@auth_router.post("/logout")
def logout(user=Depends(get_current_user)):
    # The frontend will remove its stored access token.
    # Supabase session invalidation is handled client-side.
    return {
        "message": "Logged out successfully."
    }


@auth_router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest):
    try:
        # Use the admin API to send password recovery email
        response = supabase.auth.admin.reset_password_for_email(data.email)
        return {
            "message": "Password reset link sent to your email."
        }
    except Exception as e:
        # Don't expose internal error details, but log for debugging
        print(f"Password reset error: {str(e)}")
        return {
            "message": "If an account exists with that email, a password reset link will be sent."
        }


@auth_router.post("/reset-password")
def reset_password(data: ResetPasswordRequest):
    try:
        # Verify the OTP recovery token
        response = supabase.auth.verify_otp({
            "email": data.email,
            "token": data.token,
            "type": "recovery",
        })
        
        if not response.user:
            raise HTTPException(
                status_code=400,
                detail="Invalid or expired reset token."
            )
        
        # Update the password using admin API
        supabase.auth.admin.update_user_by_id(
            response.user.id,
            {"password": data.password}
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
            detail="Invalid or expired reset token. Please request a new password reset link."
        )


@auth_router.post("/change-password")
def change_password(data: ChangePasswordRequest, user=Depends(get_current_user)):
    try:
        # Verify current password by attempting to re-authenticate
        supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": data.currentPassword,
        })
    except:
        raise HTTPException(
            status_code=401,
            detail="Current password is incorrect."
        )

    try:
        supabase.auth.update_user({"password": data.newPassword})
        return {
            "message": "Password updated successfully."
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update password: {str(e)}"
        )


@profile_router.get("")
def get_profile(user=Depends(get_current_user)):
    try:
        response = supabase.table("users").select("*").eq("id", user.id).single().execute()
        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Profile not found."
            )
        return response.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch profile: {str(e)}"
        )


@profile_router.patch("")
def update_profile(data: UpdateProfileRequest, user=Depends(get_current_user)):
    try:
        update_data = {}
        if data.fullName:
            update_data["fullName"] = data.fullName
        if data.dateOfBirth:
            update_data["dateOfBirth"] = data.dateOfBirth
        if data.gender:
            update_data["gender"] = data.gender

        if not update_data:
            raise HTTPException(
                status_code=400,
                detail="No fields to update."
            )

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
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update profile: {str(e)}"
        )


@profile_router.delete("")
def delete_account(user=Depends(get_current_user)):
    try:
        # Delete user profile from database
        supabase.table("users").delete().eq("id", user.id).execute()
        
        # Delete user from Supabase Auth
        supabase.auth.admin.delete_user(user.id)
        
        return {
            "message": "Account deleted successfully."
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete account: {str(e)}"
        )