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

**Note:** Local development runs on Vite's default port (5173) to avoid privilege issues. Port 80 is only used in Docker/production builds via Nginx.

Make sure MongoDB is running locally and update `MONGODB_URI` in `api` `.env` if needed.


