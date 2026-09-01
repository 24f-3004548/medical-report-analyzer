# Password Reset Configuration Guide

## ✅ Updated Implementation

The password reset flow has been fixed to use the correct Supabase admin API methods:
- `supabase.auth.admin.reset_password_for_email()` - sends the reset email
- `supabase.auth.verify_otp()` - verifies the recovery token
- `supabase.auth.admin.update_user_by_id()` - updates the user's password

## Setup Instructions

To enable password reset emails to work properly, you need to configure Supabase to redirect to your frontend's reset password page.

### Step 1: Configure Supabase Redirect URL

1. Go to your Supabase Dashboard
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Find **"Redirect URLs"** section
5. Add your reset password URL:
   - For **local development**: `http://localhost:5173/reset-password`
   - For **production**: `https://yourdomain.com/reset-password`

### Step 2: Enable Email Authentication

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Ensure email templates are configured (they come pre-configured by default)

### Step 3: Test the Flow

1. Start your backend and frontend servers
2. Go to your app's forgot password page (`/forgot-password`)
3. Enter your email address
4. Check your email for the reset link from Supabase
5. Click the link - it should redirect to `/reset-password?token=...&type=recovery&email=...`
6. Enter your new password and confirm
7. You should see a success message and be redirected to login

## How It Works

1. **User Requests Reset** - Goes to `/forgot-password` and enters email
2. **Backend Sends Email** - Calls `supabase.auth.admin.reset_password_for_email(email)`
3. **Supabase Sends Email** - Sends email with reset link containing token
4. **User Clicks Link** - Browser redirects to `/reset-password?token=XXX&type=recovery&email=YYY`
5. **Frontend Validates** - React page checks for valid token, type, and email
6. **User Resets Password** - Enters new password and confirms
7. **Backend Processes Reset** - Calls:
   - `supabase.auth.verify_otp(email, token, "recovery")` - verifies token
   - `supabase.auth.admin.update_user_by_id()` - updates password
8. **Success Message** - User is redirected to login with new password

## Troubleshooting

**"500 Internal Server Error" on forgot password?**
- This was the original issue - now fixed with correct admin API methods
- Make sure your Supabase project has admin API access enabled
- Check that SUPABASE_URL and SUPABASE_KEY are set correctly in your backend

**Email not arriving?**
- Check your Supabase email settings in Dashboard
- Verify the email address is correct
- Check spam/junk folder
- Ensure email provider is enabled in Supabase Authentication

**Reset link redirects but shows error?**
- Verify the redirect URL is configured in Supabase (Step 1)
- Ensure token hasn't expired (24 hour default)
- Check browser console for detailed error messages

**"Invalid or expired reset token" after clicking link?**
- Token may have expired (24 hour window)
- Browser URL might have been truncated - check full URL
- Request a new password reset link

## Token Expiration

Password reset tokens are valid for **24 hours** by default in Supabase. Users have a full day to click the reset link after requesting it.
