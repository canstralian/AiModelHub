# GitHub and Hugging Face Integration Guide

This project is set up to automatically deploy to Hugging Face Spaces from GitHub using GitHub Actions. Here's how to complete the setup:

## Required Steps

### 1. GitHub Repository Setup

This Replit project is already connected to a GitHub repository. If you want to connect it to a different repository:

1. Go to the Git panel in Replit (or use the shell)
2. Update the remote URL:
   ```bash
   git remote set-url origin https://github.com/your-username/your-repo.git
   ```

### 2. Hugging Face Space Setup

1. Create a Hugging Face account if you don't have one: [https://huggingface.co/join](https://huggingface.co/join)
2. Create a new Space:
   - Go to [https://huggingface.co/spaces](https://huggingface.co/spaces)
   - Click "Create new Space"
   - Choose "Static Site Hosting" or "Node.js" as the template (depending on your project needs)
   - Give your Space a name (note this name for later)
   - Choose visibility settings
   - Click "Create Space"

3. Generate a Hugging Face API Token:
   - Go to [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
   - Click "New token"
   - Give it a name like "GitHub Actions"
   - Select "Write" role
   - Click "Generate a token"
   - Copy the token (you will need it for GitHub Secrets)

### 3. Set up GitHub Secrets

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Add the following secrets:
   - `HF_TOKEN`: Your Hugging Face API token
   - `HF_USERNAME`: Your Hugging Face username
   - `HF_SPACE_NAME`: The name of your Hugging Face Space

### 4. Trigger Deployment

The GitHub Actions workflow is configured to run automatically when you push to the main branch. You can also trigger it manually:

1. Go to your GitHub repository
2. Click on the "Actions" tab
3. Select the "CI/CD - Deploy to Hugging Face & Manage Versioning" workflow
4. Click "Run workflow" on the right side
5. Select the branch you want to deploy and click "Run workflow"

## Understanding the Workflow

The GitHub Actions workflow (.github/workflows/deploy-to-huggingface.yml) does the following:

1. Checks out your code
2. Sets up Node.js
3. Installs dependencies
4. Runs tests
5. Gets the version from package.json
6. Deploys to Hugging Face Space
7. Creates a GitHub release

## Versioning

The version is taken from the `version` field in your package.json file. When you want to release a new version:

1. Update the version in package.json (e.g., from "1.0.0" to "1.0.1")
2. Commit and push your changes to GitHub
3. The workflow will automatically create a new release with that version number

## Troubleshooting

If you encounter issues with the deployment:

1. Check the GitHub Actions logs for detailed error messages
2. Verify that all secrets are correctly set
3. Ensure your Hugging Face Space is correctly configured
4. Check that your code is compatible with the Hugging Face environment

## Local Development

For local development in Replit, the workflow doesn't affect anything. Develop your project as usual, and when you're ready to deploy:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

The GitHub Actions workflow will handle the deployment to Hugging Face automatically.