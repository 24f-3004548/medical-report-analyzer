from datetime import date

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    full_name: str = Field(validation_alias="fullName")
    email: EmailStr
    password: str
    date_of_birth: date = Field(validation_alias="dateOfBirth")
    gender: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UpdateProfileRequest(BaseModel):
    full_name: str | None = Field(default=None, validation_alias="fullName")
    date_of_birth: date | None = Field(default=None, validation_alias="dateOfBirth")
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


class UserProfile(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    date_of_birth: date | None = None
    gender: str
