#!/bin/bash

# Adobe Analytics Data API MCP Server Runner
# This script helps set up environment variables and run the MCP server

# Check if the build directory exists
if [ ! -d "build" ]; then
  echo "Build directory not found. Running build..."
  npm run build
fi

# Function to prompt for environment variables if not set
prompt_env_var() {
  local var_name=$1
  local var_desc=$2
  local current_value=${!var_name}
  
  if [ -z "$current_value" ]; then
    read -p "$var_desc: " new_value
    export $var_name="$new_value"
  else
    echo "$var_name is already set."
  fi
}

# Prompt for required Adobe Analytics credentials
echo "Checking environment variables..."
prompt_env_var "ADOBE_CLIENT_ID" "Enter your Adobe API client ID"
prompt_env_var "ADOBE_CLIENT_SECRET" "Enter your Adobe API client secret"
prompt_env_var "ADOBE_SCOPE" "Enter your Adobe OAuth scope (comma separated)"
prompt_env_var "ADOBE_COMPANY_ID" "Enter your Adobe global company ID"
prompt_env_var "ADOBE_REPORT_SUITE_ID" "Enter your Adobe report suite ID"

# Run the MCP server
echo "Starting Adobe Analytics MCP Server..."
node build/index.js

# Note: This script will keep running until you press Ctrl+C to stop the server
