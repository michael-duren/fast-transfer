#!/bin/bash

# Configuration
RESOURCE_GROUP="rg-file-transfer-dev"
LOCATION="eastus"
# Generate a random suffix for unique storage account name
STORAGE_ACCOUNT="stfiletransferdev$RANDOM"
TABLE_NAME="FileMetadata"
CONTAINER_NAME="uploads"
APP_PLAN="asp-file-transfer-dev"
WEB_APP="app-file-transfer-dev-$RANDOM"
FUNC_APP="func-file-transfer-dev-$RANDOM"

echo "------------------------------------------------"
echo "Azure File Transfer Service - Provisioning Script"
echo "------------------------------------------------"

# 1. Resource Group
echo "Creating Resource Group: $RESOURCE_GROUP..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# 2. Storage Account
echo "Creating Storage Account: $STORAGE_ACCOUNT..."
az storage account create \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS

# Get Connection String
CONNECTION_STRING=$(az storage account show-connection-string --name $STORAGE_ACCOUNT --resource-group $RESOURCE_GROUP --output tsv)
echo "Storage Connection String retrieved."

# 3. Blob Container
echo "Creating Blob Container: $CONTAINER_NAME..."
az storage container create \
  --name $CONTAINER_NAME \
  --account-name $STORAGE_ACCOUNT \
  --connection-string "$CONNECTION_STRING"

# 4. Table Storage
echo "Creating Table: $TABLE_NAME..."
az storage table create \
  --name $TABLE_NAME \
  --account-name $STORAGE_ACCOUNT \
  --connection-string "$CONNECTION_STRING"

# 5. App Service Plan
echo "Creating App Service Plan (Linux/Python)..."
az appservice plan create \
  --name $APP_PLAN \
  --resource-group $RESOURCE_GROUP \
  --sku B1 \
  --is-linux

# 6. Web App
echo "Creating Web App: $WEB_APP..."
az webapp create \
  --name $WEB_APP \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_PLAN \
  --runtime "PYTHON:3.11"

# 7. Function App (Consumption)
# Requires its own storage or can use the same one. We'll use the same one.
echo "Creating Function App: $FUNC_APP..."
az functionapp create \
  --name $FUNC_APP \
  --storage-account $STORAGE_ACCOUNT \
  --consumption-plan-location $LOCATION \
  --resource-group $RESOURCE_GROUP \
  --os-type Linux \
  --runtime python \
  --runtime-version 3.11 \
  --functions-version 4

echo "------------------------------------------------"
echo "Provisioning Complete!"
echo "Resource Group: $RESOURCE_GROUP"
echo "Storage Account: $STORAGE_ACCOUNT"
echo "Web App URL: https://$WEB_APP.azurewebsites.net"
echo "------------------------------------------------"
echo "IMPORTANT: Update your .env file with:"
echo "AZURE_STORAGE_CONNECTION_STRING=$CONNECTION_STRING"
echo "AZURE_STORAGE_CONTAINER_NAME=$CONTAINER_NAME"
echo "AZURE_TABLE_NAME=$TABLE_NAME"
