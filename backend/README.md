# SmartHeal Backend

Node.js/Express server that powers the SmartHeal self-healing agent platform.

## Features

- **Job Processing Daemon**: Background job processing with confidence-based routing
- **AI Agent**: Detects issues and generates remediation plans
- **Guardrails**: Validates patches before execution (syntax, security, scope, quality)
- **GitHub Integration**: Automated PR creation for fixes
- **Error Capture**: SmartHeal SDK for error reporting

## Prerequisites

- Node.js 18+
- MongoDB (local or cloud instance)
- GitHub OAuth App (for repository integration)

## Setup

1. **Install dependencies**:

   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables**:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and fill in:
   - `MONGODB_URI`: MongoDB connection string
   - `GITHUB_CLIENT_ID`: GitHub OAuth App client ID
   - `GITHUB_CLIENT_SECRET`: GitHub OAuth App client secret
   - `SESSION_SECRET`: Random string for session encryption

3. **Create GitHub OAuth App**:
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Click "New OAuth App"
   - Set Homepage URL to `http://localhost:3001`
   - Set Callback URL to `http://localhost:3001/api/github/callback`
   - Copy the Client ID and Client Secret to your `.env` file

4. **Start the server**:
   ```bash
   npm run dev
   ```

The server will start on port 3001 and the daemon will begin polling for jobs.

## Architecture

### Job Processing Flow

1. **Ingestion**: Jobs are created via `POST /api/jobs` with status `NEW`
2. **Daemon Pickup**: `daemon/watcher.js` polls every 2 seconds, atomically picks up jobs
3. **Agent Analysis**: `agent/agent.js` generates remediation plans with confidence scores
4. **Decision Routing**:
   - Confidence < 0.5: Job rejected (status → `FAILED`)
   - Confidence 0.5–0.85: Awaits manual approval (status → `AWAITING_APPROVAL`)
   - Confidence > 0.85: Auto-approved (continues to guardrails)
5. **Guardrails**: `guardrails/validate.js` runs all validation checks
6. **Execution**: Creates GitHub PR or applies patch directly
7. **Finalization**: Job status updated to `DONE` or `FAILED`

### Key Components

- **`daemon/watcher.js`**: Background job processing daemon
- **`agent/agent.js`**: AI agent orchestration
- **`guardrails/validate.js`**: Patch validation orchestrator
- **`services/githubService.js`**: GitHub API integration
- **`routes/github.js`**: GitHub OAuth and repo management

## API Endpoints

### Jobs

- `POST /api/jobs` - Create a new job
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/:id` - Get job details

### GitHub

- `GET /api/github/auth` - Initiate GitHub OAuth flow
- `GET /api/github/callback` - Handle OAuth callback
- `GET /api/github/repos` - List user's repositories
- `POST /api/github/select-repo` - Connect a repository

### Health

- `GET /health` - Health check endpoint

## Troubleshooting

### GitHub API 403 Error: "Resource not accessible by integration"

This error occurs when the GitHub OAuth token doesn't have sufficient permissions:

1. **GitHub App vs OAuth App**: Ensure you're using a GitHub OAuth App, not a GitHub App
2. **Missing 'repo' scope**: The OAuth App must have 'repo' scope enabled
3. **Branch protection rules**: Check repository settings for branch protection
4. **Expired token**: Reconnect the repository to get a fresh token

See [`LLM_CONTEXT.md`](../LLM_CONTEXT.md) for detailed troubleshooting steps.

### GitHub API 401 Error: "OAuth token is invalid or expired"

This error occurs when the OAuth token stored in the `Repo` model is invalid or expired.

**Common causes**:

1. Token expired (GitHub OAuth tokens can expire)
2. Token was revoked by user
3. Token was never valid

**Fix**:

1. Reconnect the repository through the ConnectRepoWizard
2. Ensure you're using a valid GitHub OAuth App
3. Check that the OAuth App has 'repo' scope enabled

**Token validation**: The [`githubService.js`](services/githubService.js) validates tokens before attempting PR creation, providing early detection of expired tokens.

## Development

### Running Tests

```bash
npm test
```

### Code Style

The project uses ESLint for code style. Run:

```bash
npm run lint
```

### Adding New Features

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and add tests
3. Run tests: `npm test`
4. Commit with conventional message: `git commit -m "feat: add your feature"`
5. Push and create PR
