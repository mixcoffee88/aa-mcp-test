#!/bin/bash

# Google Analytics Data API MCP Server Runner
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

# Prompt for required environment variables if not set
echo "Checking environment variables..."
prompt_env_var "GOOGLE_CLIENT_EMAIL" "Enter your Google service account email"
prompt_env_var "GOOGLE_PRIVATE_KEY" "Enter your Google service account private key"
prompt_env_var "GA_PROPERTY_ID" "Enter your Google Analytics property ID"

# Run the server
echo "Starting Google Analytics MCP Server..."
node build/index.js

# Note: This script will keep running until you press Ctrl+C to stop the server