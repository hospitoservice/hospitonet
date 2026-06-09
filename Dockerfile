# ── Stage 1: install dependencies ───────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ── Stage 2: production build (nginx) ────────────────────────────────────────
FROM deps AS builder
COPY . .
RUN npm run build

FROM nginx:stable-alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# ── Stage 3: development (Vite dev server) ───────────────────────────────────
FROM deps AS development
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]