#!/bin/bash

echo "Fixing node_modules for YAPP API..."

# Remove node_modules and package-lock.json
echo "Removing old node_modules and package-lock.json..."
rm -rf node_modules
rm -f package-lock.json

# Clean npm cache
echo "Cleaning npm cache..."
npm cache clean --force

# Install dependencies
echo "Installing dependencies..."
npm install

echo "Done! node_modules has been reinstalled."
