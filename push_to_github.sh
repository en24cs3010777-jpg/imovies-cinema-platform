#!/bin/bash
# Push IMovies project to GitHub repository

echo "🎬 Pushing IMovies to https://github.com/en24cs3010777-jpg/imovies-cinema-platform ..."

git remote set-url origin https://github.com/en24cs3010777-jpg/imovies-cinema-platform.git
git push -u origin main

if [ $? -eq 0 ]; then
  echo "✅ Push successful! Visit https://github.com/en24cs3010777-jpg/imovies-cinema-platform"
else
  echo "⚠️  If prompted for password, use a GitHub Personal Access Token (PAT) with 'repo' scope."
fi
