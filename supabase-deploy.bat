@echo off
REM Supabase Functions Deployment Script for Windows

echo Deploying Supabase functions...

REM Deploy architect-bot function
echo Deploying architect-bot...
supabase functions deploy architect-bot

REM Deploy welcome-user function
echo Deploying welcome-user...
supabase functions deploy welcome-user

echo All functions deployed successfully!
echo You can inspect your deployments in the Dashboard: https://supabase.com/dashboard/project/hdcnitfvaeetutqqtjqc/functions

pause