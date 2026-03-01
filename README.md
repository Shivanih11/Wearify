# Wearify — AI Virtual Fashion Try-On

Wearify is a full-stack AI-powered web app that acts like a Snapchat-style clothing filter.

## Features
- Upload clothing screenshot from e-commerce apps.
- AI background removal with `rembg` (transparent PNG output).
- Real-time webcam try-on with MediaPipe Pose.
- Shoulder/hip keypoint alignment + tilt-aware rotation + smoothing.
- Dark-mode startup-style UI (Tailwind + Framer Motion + glassmorphism).
- Auth, wardrobe management, try-on snapshot history.

## Project Structure

```
frontend/                # React + Vite + Tailwind + Framer Motion
backend/                 # FastAPI API, AI processing, auth and data APIs
ai_models/               # Model notes/checkpoints placeholder
database/schemas/        # SQL schema
storage/                 # Uploaded and processed media
```

## Run with Docker

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API docs: http://localhost:8000/docs

## Run Locally

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Key APIs
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/clothes/upload`
- `GET /api/clothes/mine`
- `POST /api/tryon/save`
- `GET /api/tryon/history`

## Notes
- For production, use HTTPS, secure JWT cookies, and object storage (S3/GCS).
- Add CDN-hosted model files or self-hosted rembg models for deterministic deployments.
