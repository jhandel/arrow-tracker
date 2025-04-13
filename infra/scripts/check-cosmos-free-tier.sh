#!/bin/bash
# Filename: check-cosmos-free-tier.sh
# Description: Checks if a Cosmos DB free tier account already exists in the subscription
# and returns true if no free tier account exists, false otherwise

# This prevents azure cli errors from being swallowed
set -e

# Check if free tier is already in use
FREE_TIER_ACCOUNTS=$(az cosmosdb list --query "[?properties.enableFreeTier==\`true\`].name" -o tsv)

if [ -n "$FREE_TIER_ACCOUNTS" ]; then
    echo "false"
else
    echo "true"
fi