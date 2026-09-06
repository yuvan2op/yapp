## Yapp MERN Demo (Portfolio-Ready)

This is a minimal, **production-style MERN stack** example suitable for learning and portfolio use.

- **Frontend**: React (Vite) in the `client` folder
- **Backend**: Node.js + Express + MongoDB (Mongoose) in the `api` folder
- **Database**: MongoDB (Docker container)
- **Reverse proxy + static serving**: Nginx inside the `client` image
- **Container orchestration**: `docker-compose` from the project root

### Architecture

- `client` container:
  - Builds the React app with Vite.
  - Serves static files via Nginx.
  - Proxies any request starting with `/api` to the `api` service.
  - Exposed on **host port 80**.

- `api` container:
  - Express server listening on **port 5000**.
  - Connects to MongoDB via `mongodb://mongo:27017/yapp_db`.
  - Exposed on **host port 5000**.

- `mongo` container:
  - Standard MongoDB server.
  - Data persisted using a Docker volume.

### Endpoints

- `GET /api/health` – basic health check.
- `GET /api/items` – list demo "items" from MongoDB.
- `POST /api/items` – create a new item.

### Running with Docker

From the project root:

```bash
docker compose up --build
```

Then:

- Frontend (via Nginx + reverse proxy): `http://localhost`
- Backend (direct): `http://localhost:5000/api/health`

**Note:** Port 80 requires administrator/root privileges on Linux/WSL. If you encounter permission errors, you may need to run Docker with `sudo` or configure your system accordingly.

### Deploying with GitHub Actions

The workflow in `.github/workflows/deploy.yml` builds the backend and frontend images, pushes them to Amazon ECR, and deploys the immutable commit-SHA images to EC2 through AWS Systems Manager Run Command. No inbound SSH access is required. The EC2 host must have the SSM Agent, Docker Engine, the Docker Compose plugin, AWS CLI, `curl`, and `git` installed.

Add these repository variables in **Settings > Secrets and variables > Actions > Variables**:

- `AWS_ACCOUNT_ID` - your 12-digit AWS account ID
- `AWS_REGION` - optional AWS region, defaulting to `ap-south-1`
- `EC2_INSTANCE_ID` - target EC2 instance ID
- `DEPLOY_PATH` - optional remote directory, defaulting to `/opt/yapp`
- `DEPLOY_BRANCH` - optional Git branch, defaulting to `main`
- `BACKEND_REPOSITORY` - optional ECR repository, defaulting to `yapp-backend`
- `FRONTEND_REPOSITORY` - optional ECR repository, defaulting to `yapp-frontend`

The workflow uses GitHub OIDC and assumes `github-actions-deploy-role`.

Create the `yapp-backend` and `yapp-frontend` ECR repositories before the first run. Then clone this repository on the EC2 instance at `DEPLOY_PATH`, for example `/opt/yapp`, and make sure the instance can fetch the repository from GitHub. For a private repository, configure a read-only deploy key or another Git credential on the instance. The EC2 instance profile needs `AmazonSSMManagedInstanceCore` plus ECR pull permissions: `ecr:GetAuthorizationToken`, `ecr:BatchCheckLayerAvailability`, `ecr:GetDownloadUrlForLayer`, and `ecr:BatchGetImage`. The GitHub Actions IAM role needs ECR push permissions: `ecr:GetAuthorizationToken`, `ecr:BatchCheckLayerAvailability`, `ecr:CompleteLayerUpload`, `ecr:InitiateLayerUpload`, `ecr:PutImage`, and `ecr:UploadLayerPart`, plus `ssm:SendCommand`, `ssm:GetCommandInvocation`, and `ssm:ListCommandInvocations` on the target instance.

The workflow runs `git fetch`, resets to the selected branch, logs in to ECR, pulls the exact commit-SHA images, and executes `docker compose up -d --no-build --remove-orphans` through SSM. The `mongo-data` volume is preserved between deployments. The instance security group only needs to allow the application ports required by users, such as 80 and 5000; SSH port 22 is not required for this workflow.

### Local Development (optional, without Docker)

You can also run services locally:

```bash
# install root deps (workspaces)
npm install

# in one terminal - backend
cd api
npm install
npm run dev

# in another terminal - frontend
cd client
npm install
npm run dev
```

Make sure MongoDB is running locally and update `MONGODB_URI` in `api` `.env` if needed.


