#!/bin/bash
set -e

# Clean top-level dist only (don't wipe pre-downloaded MFE dists)
rm -rf dist
rm -rf packages/about/dist packages/posts/dist packages/pets/dist packages/shell/dist

# Build non-submodule remotes
npm run build -w packages/about
npm run build -w packages/posts
npm run build -w packages/pets

# Build submodule MFEs only if their dist doesn't already exist (CI pre-downloads them)
for mfe in shikaku sokoban slitherlink; do
  if [ -d "packages/$mfe/dist" ] && [ -f "packages/$mfe/dist/assets/remoteEntry.js" ]; then
    echo "Using pre-built dist for $mfe"
  else
    echo "Building $mfe from source..."
    npm run build -w packages/$mfe
  fi
done

# Build shell host
npm run build -w packages/shell

# Arrange output folder
mkdir -p dist/mfe/about
mkdir -p dist/mfe/posts
mkdir -p dist/mfe/pets
mkdir -p dist/mfe/shikaku
mkdir -p dist/mfe/sokoban
mkdir -p dist/mfe/slitherlink

cp -r packages/shell/dist/* dist/
cp -r packages/about/dist/* dist/mfe/about/
cp -r packages/posts/dist/* dist/mfe/posts/
cp -r packages/pets/dist/* dist/mfe/pets/
cp -r packages/shikaku/dist/* dist/mfe/shikaku/
cp -r packages/sokoban/dist/* dist/mfe/sokoban/
cp -r packages/slitherlink/dist/* dist/mfe/slitherlink/

echo "Build assembled successfully in dist/!"
