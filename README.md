# Dockeranium

A modern Docker control panel built with Next.js and Django.

## Features

- 🎯 Clean and intuitive dashboard interface
- 🔐 User authentication system
- 📱 Responsive sidebar navigation
- 👤 User profile management

## Project Structure

The application will be available at:
- Frontend: http://localhost:3000

### Build and Deploy to Harbor

#### Prerequisites
- Docker installed and running
- Access to Harbor registry
- Harbor credentials configured

#### 1. Build Docker Images

Build the frontend production image:

```bash
docker build -t dockeranium-web:{tag} -f frontend/Dockerfile.prod .
docker build -t dockeranium-api:{tag} -f backend/Dockerfile.prod .
```

#### 2. Tag Docker Images

```bash
docker tag dockeranium-web:{tag} {registry}/dockeranium-web:{tag}
docker tag dockeranium-api:{tag} {registry}/dockeranium-api:{tag}
```

#### 3. Push Docker Images to Harbor

```bash
docker push {registry}/dockeranium-web:{tag}
docker push {registry}/dockeranium-api:{tag}
```