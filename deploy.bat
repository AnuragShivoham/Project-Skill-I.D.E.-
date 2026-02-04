@echo off
REM Project-Skill Chatbot Deployment Script (Windows PowerShell version)
REM This script automates the deployment of the mentor_reports table and Supabase function

echo ==========================================
echo Project-Skill Chatbot Deployment
echo ==========================================
echo.

REM Check if Supabase CLI is installed
supabase --version >nul 2>&1
if errorlevel 1 (
    echo Error: Supabase CLI not found. Install it with:
    echo    npm install -g supabase
    exit /b 1
)

REM Get project ref from user
set /p PROJECT_REF="Enter your Supabase project ref (e.g. xyznopqrstuv): "

if "%PROJECT_REF%"=="" (
    echo Error: Project ref is required
    exit /b 1
)

echo.
echo Project ref: %PROJECT_REF%
echo.

REM Step 1: Check if LOVABLE_API_KEY is set
echo Step 1: Checking LOVABLE_API_KEY secret...
supabase secrets list --project-ref %PROJECT_REF% 2>nul | find "LOVABLE_API_KEY" >nul
if %errorlevel% equ 0 (
    echo ^✓ LOVABLE_API_KEY is already set
) else (
    echo ^⚠ LOVABLE_API_KEY not found. You'll need to set it manually:
    echo    supabase secrets set LOVABLE_API_KEY=^<your-key^> --project-ref %PROJECT_REF%
    set /p CONTINUE="Continue without setting it? (y/n): "
    if /i not "%CONTINUE%"=="y" exit /b 1
)

REM Step 2: Run the migration
echo.
echo Step 2: Running database migration...
echo    This will create the mentor_reports table...
supabase migration up --project-ref %PROJECT_REF% >nul 2>&1
if %errorlevel% neq 0 (
    echo ^⚠ Migration may have already been applied. Continuing...
)
echo ^✓ Database migration complete

REM Step 3: Deploy the function
echo.
echo Step 3: Deploying bodhit-chat function...
supabase functions deploy bodhit-chat --project-ref %PROJECT_REF%
if %errorlevel% neq 0 (
    echo Error: Failed to deploy function
    exit /b 1
)
echo ^✓ Function deployed

REM Step 4: Verify deployment
echo.
echo Step 4: Verifying deployment...
supabase functions list --project-ref %PROJECT_REF% 2>nul | find "bodhit-chat" >nul
if %errorlevel% equ 0 (
    echo ^✓ bodhit-chat function is deployed
) else (
    echo Error: bodhit-chat function not found
    exit /b 1
)

echo.
echo ==========================================
echo ^✓ Deployment Complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Start the dev server: npm run dev
echo 2. Login as a student
echo 3. Open the floating chat and test the intake flow
echo 4. Check function logs if you encounter issues:
echo    supabase functions logs bodhit-chat --project-ref %PROJECT_REF% --follow
echo.
