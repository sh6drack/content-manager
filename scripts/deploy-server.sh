#!/bin/bash
# Polarity Lab Server Script
# Paste this entire block into EC2 Instance Connect terminal.
#
# First run: installs everything and starts campaign
# Subsequent runs: pulls latest code, restarts campaign with new templates

set -e

echo "================================================"
echo "  POLARITY LAB Server"
echo "================================================"

# Install Node.js 22 if not present
if ! command -v node &> /dev/null || [[ "$(node -v)" != v22* ]]; then
  echo "[setup] Installing Node.js 22..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs screen git
else
  echo "[setup] Node.js $(node -v) already installed"
fi

# Clone or pull
cd ~
if [ -d "content-manager" ]; then
  echo "[update] Pulling latest code..."
  cd content-manager && git pull
else
  echo "[setup] Cloning content-manager..."
  git clone https://github.com/sh6drack/content-manager.git
  cd content-manager
fi

echo "[deps] Installing dependencies..."
npm install --silent

# Set up env if not exists
if [ ! -f .env.local ]; then
  echo "[env] Creating .env.local..."
  cat > .env.local << 'ENVEOF'
RESEND_API_KEY=re_JPD6mQCC_CQc6Lq2dWiBKNDXs9z3aQjd1
ENVEOF
else
  echo "[env] .env.local already exists"
fi

# Kill old campaign if running
if screen -list | grep -q outreach; then
  echo "[restart] Stopping old campaign..."
  screen -S outreach -X quit 2>/dev/null || true
  sleep 1
fi

echo "[launch] Starting campaign with latest templates..."
screen -dmS outreach bash -c 'npx tsx scripts/run-outreach.ts --email 2>&1 | tee outreach.log'

echo ""
echo "================================================"
echo "  Campaign running with latest templates"
echo "  screen -r outreach    to watch live"
echo "  Ctrl+A then D         to detach"
echo "  tail -f outreach.log  to check logs"
echo "================================================"
