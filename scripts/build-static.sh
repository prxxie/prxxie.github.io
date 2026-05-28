#!/bin/bash
set -e

# Clean dist folders
rm -rf dist packages/*/dist

# Build remotes
npm run build -w packages/about
npm run build -w packages/posts
npm run build -w packages/pets

# Build shell host
npm run build -w packages/shell

# Arrange output folder
mkdir -p dist/mfe/about
mkdir -p dist/mfe/posts
mkdir -p dist/mfe/pets

cp -r packages/shell/dist/* dist/
cp -r packages/about/dist/* dist/mfe/about/
cp -r packages/posts/dist/* dist/mfe/posts/
cp -r packages/pets/dist/* dist/mfe/pets/

# Copy blog files
mkdir -p dist/posts
cp -r public/posts/* dist/posts/

echo "Build assembled successfully in dist/!"
