#!/bin/bash
# Polarity Lab — Server Deployment Script
# Paste this entire block into EC2 Instance Connect terminal.
#
# What it does:
# 1. Installs Node.js 22 LTS
# 2. Clones the content-manager repo
# 3. Installs dependencies
# 4. Sets up environment variables
# 5. Runs the outreach campaign in a screen session (survives disconnect)

set -e

echo "═══════════════════════════════════════════"
echo "  POLARITY LAB — Server Deployment"
echo "═══════════════════════════════════════════"

# Install Node.js 22 LTS
echo "[1/5] Installing Node.js 22..."
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs screen git

echo "[2/5] Cloning content-manager..."
cd ~
if [ -d "content-manager" ]; then
  cd content-manager && git pull
else
  git clone https://github.com/sh6drack/content-manager.git
  cd content-manager
fi

echo "[3/5] Installing dependencies..."
npm install

echo "[4/5] Setting up environment..."
cat > .env.local << 'ENVEOF'
RESEND_API_KEY=re_JPD6mQCC_CQc6Lq2dWiBKNDXs9z3aQjd1
# Reddit (fill in when you have API access)
# REDDIT_CLIENT_ID=
# REDDIT_CLIENT_SECRET=
# REDDIT_USERNAME=
# REDDIT_PASSWORD=
ENVEOF

echo "[5/5] Starting outreach agent in screen session..."
echo ""
echo "═══════════════════════════════════════════"
echo "  Ready! Starting campaign..."
echo "  Use 'screen -r outreach' to reattach"
echo "  Use Ctrl+A then D to detach"
echo "═══════════════════════════════════════════"

# Run in a screen session so it survives terminal disconnect
screen -dmS outreach bash -c 'npx tsx scripts/run-outreach.ts --email 2>&1 | tee outreach.log'
echo "Campaign running in background. View with: screen -r outreach"
echo "Or check logs: tail -f ~/content-manager/outreach.log"
