# Podman Guide for NeoRealm

This document explains how to run NeoRealm using Podman instead of Docker.

## Prerequisites

1. Install Podman on your system:
   - Windows: Install WSL2 and Podman in WSL2, or use Podman Desktop
   - macOS: `brew install podman` or install Podman Desktop
   - Linux: Package manager (e.g., `sudo apt install podman` or `sudo dnf install podman`)

2. For Windows users: Make sure WSL2 is properly configured with systemd support if using Podman in WSL2

## Setup

1. Install Podman Compose (if not included with your Podman installation):
   ```bash
   pip install podman-compose
   ```

2. Ensure you have your environment variables set up in `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Running the Application

### Development Mode
To run in development mode with live reloading:

```bash
cd neo-realm
podman-compose up
```

### Production Mode
To run in production mode:

```bash
cd neo-realm
podman-compose -f podman-compose.prod.yml up
```

### Building the Image
To build the container image manually:

```bash
cd neo-realm
podman build -t neo-realm .
```

### Running the Built Image
After building:

```bash
podman run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
  neo-realm
```

## Development with Podman

For active development, you may prefer to mount your source code as a volume to avoid rebuilding on every change. Use the development podman-compose file which is already configured for this:

```bash
podman-compose up
```

## Troubleshooting

1. If you encounter permission issues on Linux:
   ```bash
   podman unshare
   # Then run your podman commands inside this session
   ```

2. If the container can't connect to Supabase:
   - Verify your `.env.local` contains the correct Supabase URLs
   - Check that you can access Supabase directly from your host machine

3. For volume mounting issues on Windows with WSL2:
   - Make sure your project directory is in the WSL2 file system
   - Or configure proper volume mounts between Windows and WSL2

## Building and Deploying

The container is set up to work with the standalone output from Next.js, making it suitable for deployment to containerized environments.

To build a production-ready image:
```bash
podman build --target=runner -t neo-realm:prod .
```

## Podman vs Docker Compatibility

The configuration files in this project (Dockerfile, podman-compose.yml) are compatible with both Docker and Podman. The naming convention uses "podman" to indicate these are optimized for Podman usage, but they will work the same way with Docker if you have it installed instead.

The main advantages of using Podman:
- Rootless containers
- No daemon required
- Better security model
- Systemd integration for rootless containers