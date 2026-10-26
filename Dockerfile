# Playwright's image ships the Chromium build that renders the PDFs. Its own Node is whatever
# was current when that image was built, so we drop in a pinned, patched Node on top.
FROM mcr.microsoft.com/playwright:v1.56.1-noble
# Node 24.22.1 fixes CVE-2026-111497 (Brotli RCE) and the other Oct 21 2026 security fixes.
# Bump this tag by hand on every Node security release (see notes/PROJECT-NOTES.md).
COPY --from=node:24.22.1-bookworm-slim /usr/local/bin/node /usr/local/bin/node
# /usr/local/bin comes before /usr/bin on PATH, so npm and `npm start` use this Node. Fail the
# build if it doesn't.
RUN test "$(node -v)" = "v24.22.1" || (echo "Expected Node v24.22.1, got $(node -v)" && exit 1)
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
ENV NODE_ENV=production DATA_DIR=/data
CMD ["npm", "start"]
