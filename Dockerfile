FROM node:26-trixie-slim

ENV NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Keep this version in sync with @playwright/test in package.json.
RUN npx -y playwright@1.65.0 install --with-deps chromium \
    && rm -rf /var/lib/apt/lists/* /root/.npm

WORKDIR /app
