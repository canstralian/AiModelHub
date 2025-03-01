# Hugging Face Spaces API Interface

A web application for interfacing with Hugging Face Spaces API, designed to provide an intuitive and powerful model inference experience. The application features a split-panel interface for seamless model interaction and result visualization.

## Features

- Interactive UI for model inference
- Support for multiple Hugging Face models
- Split-panel interface for code and results
- Customizable model parameters
- Response visualization
- Authentication system
- Request history tracking

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js
- **API Integration**: Hugging Face Spaces API

## Development

This project is developed on Replit and automatically deployed to Hugging Face Spaces via GitHub Actions.

### Development Workflow

1. Make changes in Replit
2. Test locally
3. Commit and push to GitHub
4. GitHub Actions automatically deploys to Hugging Face Spaces

For more details on the integration between Replit, GitHub, and Hugging Face, see [GITHUB_HUGGINGFACE_INTEGRATION.md](GITHUB_HUGGINGFACE_INTEGRATION.md).

## Getting Started

1. Clone this repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open your browser to the Replit preview URL

## Environment Variables

The following environment variables are required:

- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session management
- (Optional) `HF_API_KEY`: Default Hugging Face API key for server-side requests

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request

## License

MIT