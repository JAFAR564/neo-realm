#!/bin/bash
# Supabase Functions Deployment Script

echo "Deploying Supabase functions..."

# Deploy architect-bot function
echo "Deploying architect-bot..."
supabase functions deploy architect-bot

# Deploy welcome-user function
echo "Deploying welcome-user..."
supabase functions deploy welcome-user

echo "All functions deployed successfully!"
echo "You can inspect your deployments in the Dashboard: https://supabase.com/dashboard/project/hdcnitfvaeetutqqtjqc/functions"