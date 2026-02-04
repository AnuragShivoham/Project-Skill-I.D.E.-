#!/bin/bash
# Project-Skill Chatbot Deployment Script
# This script automates the deployment of the mentor_reports table and Supabase function

set -e  # Exit on error

echo "=========================================="
echo "Project-Skill Chatbot Deployment"
echo "=========================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Install it with:"
    echo "   npm install -g supabase"
    exit 1
fi

# Get project ref from user
read -p "Enter your Supabase project ref (e.g., xyznopqrstuv): " PROJECT_REF

if [ -z "$PROJECT_REF" ]; then
    echo "❌ Project ref is required"
    exit 1
fi

echo ""
echo "✓ Project ref: $PROJECT_REF"
echo ""

# Step 1: Check if LOVABLE_API_KEY is set
echo "📋 Step 1: Checking LOVABLE_API_KEY secret..."
if supabase secrets list --project-ref "$PROJECT_REF" | grep -q "LOVABLE_API_KEY"; then
    echo "✅ LOVABLE_API_KEY is already set"
else
    echo "⚠️  LOVABLE_API_KEY not found. You'll need to set it manually:"
    echo "   supabase secrets set LOVABLE_API_KEY=<your-key> --project-ref $PROJECT_REF"
    read -p "Continue without setting it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 2: Run the migration
echo ""
echo "📋 Step 2: Running database migration..."
echo "   This will create the mentor_reports table..."
supabase migration up --project-ref "$PROJECT_REF" 2>/dev/null || {
    echo "⚠️  Migration may have already been applied. Continuing..."
}
echo "✅ Database migration complete"

# Step 3: Deploy the function
echo ""
echo "📋 Step 3: Deploying bodhit-chat function..."
supabase functions deploy bodhit-chat --project-ref "$PROJECT_REF"
echo "✅ Function deployed"

# Step 4: Verify deployment
echo ""
echo "📋 Step 4: Verifying deployment..."
if supabase functions list --project-ref "$PROJECT_REF" | grep -q "bodhit-chat"; then
    echo "✅ bodhit-chat function is deployed"
else
    echo "❌ bodhit-chat function not found"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Start the dev server: npm run dev"
echo "2. Login as a student"
echo "3. Open the floating chat and test the intake flow"
echo "4. Check function logs if you encounter issues:"
echo "   supabase functions logs bodhit-chat --project-ref $PROJECT_REF --follow"
echo ""
