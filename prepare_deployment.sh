#!/bin/bash

# YOLO Living — Deployment Preparation
# Builds minified assets and packages for Hostinger upload

DEPLOY_DIR="deploy_build"
ZIP_FILE="website_deploy.zip"

# Clean previous build
rm -rf "$DEPLOY_DIR"
rm -f "$ZIP_FILE"

# Build minified CSS/JS
echo "Building minified assets..."
mkdir -p dist
npm run build

# Copy files to deploy directory
echo "Copying files to $DEPLOY_DIR..."
mkdir "$DEPLOY_DIR"

rsync -av --progress . "$DEPLOY_DIR" \
    --exclude node_modules \
    --exclude .git \
    --exclude .DS_Store \
    --exclude "$DEPLOY_DIR" \
    --exclude "$ZIP_FILE" \
    --exclude "*.py" \
    --exclude "server.js" \
    --exclude "package.json" \
    --exclude "package-lock.json" \
    --exclude "README.md" \
    --exclude "LICENSE" \
    --exclude ".vscode" \
    --exclude ".idea" \
    --exclude "admin" \
    --exclude "prepare_deployment.sh" \
    --exclude "eslint.config.mjs" \
    --exclude ".prettierrc" \
    --exclude ".gitignore" \
    --exclude ".env" \
    --exclude "dist" \
    --exclude "Gemini.md" \
    --exclude "brandguidelines.md" \
    --exclude "*.JPG" \
    --exclude "*.MOV"

# Use minified CSS/JS in deploy
cp dist/style.css "$DEPLOY_DIR/style.css"
cp dist/script.js "$DEPLOY_DIR/script.js"

# Create zip
echo "Creating zip file $ZIP_FILE..."
cd "$DEPLOY_DIR"
zip -r "../$ZIP_FILE" .
cd ..

# Clean up deploy dir
rm -rf "$DEPLOY_DIR"

echo "Deployment preparation complete!"
echo "Upload $ZIP_FILE to Hostinger."
