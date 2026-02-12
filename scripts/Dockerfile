# Polarity Lab Outreach Agent
# Runs on AWS EC2/ECS to send VC emails and post to Reddit
#
# Build:  docker build -t polarity-outreach -f scripts/Dockerfile .
# Run:    docker run --env-file .env polarity-outreach --email --reddit
# Dry:    docker run --env-file .env polarity-outreach --email --dry-run

FROM node:20-slim

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --production=false

# Copy source
COPY src/ src/
COPY scripts/ scripts/
COPY tsconfig.json ./

# Install tsx for running TypeScript directly
RUN npx tsx --version || npm install -g tsx

ENTRYPOINT ["npx", "tsx", "scripts/run-outreach.ts"]
CMD ["--email", "--reddit"]
