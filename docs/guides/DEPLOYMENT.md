# BiteLogs Deployment Guide

## Overview

This guide covers deploying BiteLogs to various environments, from local development to production.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Environment Variables

### Server Environment Variables

Create `server/.env`:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bitelogs

# Authentication
JWT_SECRET=your-super-secret-key-at-least-32-characters
JWT_EXPIRES_IN=7d

# Server
NODE_ENV=development
PORT=3001
LOG_LEVEL=debug

# File uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

### Client Environment Variables

Create `client/.env`:

```bash
VITE_API_URL=/api
```

## Local Development

### 1. Install Dependencies

```bash
# Root dependencies
npm install

# Server dependencies
cd server && npm install

# Client dependencies
cd ../client && npm install
```

### 2. Set Up Database

```bash
# Create database
createdb bitelogs

# Run migrations
cd server
npm run migrate

# Seed demo data (optional)
npm run seed
```

### 3. Start Development Servers

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

Access:
- Frontend: http://localhost:5173
- API: http://localhost:3001/api

## Production Build

### Build Client

```bash
cd client
npm run build
```

Output is in `client/dist/`.

### Build Server

```bash
cd server
npm run build
```

Output is in `server/dist/`.

## Production Deployment

### Option 1: Traditional Server

1. **Provision Server**
   - Ubuntu 22.04 LTS recommended
   - 2GB RAM minimum
   - Install Node.js 18+, PostgreSQL 14+

2. **Set Up Database**
   ```bash
   sudo -u postgres createuser bitelogs
   sudo -u postgres createdb -O bitelogs bitelogs
   ```

3. **Deploy Application**
   ```bash
   # Clone repository
   git clone https://github.com/your-repo/bitelogs.git
   cd bitelogs
   
   # Install dependencies
   npm ci --production
   cd server && npm ci --production
   cd ../client && npm ci --production
   
   # Build
   cd client && npm run build
   cd ../server && npm run build
   
   # Run migrations
   npm run migrate
   ```

4. **Set Up Process Manager**
   ```bash
   # Install PM2
   npm install -g pm2
   
   # Start application
   pm2 start server/dist/index.js --name bitelogs
   
   # Save PM2 config
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       # Serve static files
       location / {
           root /var/www/bitelogs/client/dist;
           try_files $uri $uri/ /index.html;
       }
       
       # Proxy API requests
       location /api {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_cache_bypass $http_upgrade;
       }
       
       # Serve uploaded files
       location /uploads {
           alias /var/www/bitelogs/server/uploads;
       }
   }
   ```

6. **Set Up SSL with Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

### Option 2: Docker

1. **Create Dockerfile for Server**
   ```dockerfile
   # server/Dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci --production
   
   COPY dist ./dist
   COPY uploads ./uploads
   
   EXPOSE 3001
   
   CMD ["node", "dist/index.js"]
   ```

2. **Create Dockerfile for Client**
   ```dockerfile
   # client/Dockerfile
   FROM nginx:alpine
   
   COPY dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   
   EXPOSE 80
   ```

3. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   
   services:
     db:
       image: postgres:14-alpine
       environment:
         POSTGRES_USER: bitelogs
         POSTGRES_PASSWORD: ${DB_PASSWORD}
         POSTGRES_DB: bitelogs
       volumes:
         - postgres_data:/var/lib/postgresql/data
       healthcheck:
         test: ["CMD-SHELL", "pg_isready -U bitelogs"]
         interval: 5s
         timeout: 5s
         retries: 5
   
     api:
       build: ./server
       environment:
         DATABASE_URL: postgresql://bitelogs:${DB_PASSWORD}@db:5432/bitelogs
         JWT_SECRET: ${JWT_SECRET}
         NODE_ENV: production
       depends_on:
         db:
           condition: service_healthy
       volumes:
         - uploads:/app/uploads
   
     web:
       build: ./client
       ports:
         - "80:80"
       depends_on:
         - api
   
   volumes:
     postgres_data:
     uploads:
   ```

4. **Deploy with Docker Compose**
   ```bash
   docker-compose up -d --build
   ```

### Option 3: Cloud Platforms

#### Heroku

```bash
# Create apps
heroku create bitelogs-api
heroku create bitelogs-web

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev -a bitelogs-api

# Set environment variables
heroku config:set JWT_SECRET=your-secret -a bitelogs-api
heroku config:set NODE_ENV=production -a bitelogs-api

# Deploy
git push heroku main
```

#### Railway

1. Create new project
2. Add PostgreSQL database
3. Connect GitHub repository
4. Configure environment variables
5. Deploy

#### Vercel (Frontend) + Railway (Backend)

1. Deploy backend to Railway
2. Connect Vercel to frontend directory
3. Set `VITE_API_URL` to Railway backend URL

## Health Checks

The application exposes health check endpoints:

```bash
# Full health check
curl http://localhost:3001/api/health

# Kubernetes liveness probe
curl http://localhost:3001/api/live

# Kubernetes readiness probe
curl http://localhost:3001/api/ready
```

## Monitoring

### Logging

Logs are output in JSON format in production:

```json
{
  "level": "info",
  "message": "Server running on port 3001",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

Use log aggregation services like:
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Datadog
- Papertrail

### Metrics

For production monitoring, consider adding:
- Prometheus metrics endpoint
- Application Performance Monitoring (APM)
- Error tracking (Sentry)

## Backup Strategy

### Database Backups

```bash
# Manual backup
pg_dump bitelogs > backup_$(date +%Y%m%d).sql

# Restore
psql bitelogs < backup_20240115.sql
```

### Automated Backups

```bash
# Add to crontab
0 2 * * * pg_dump bitelogs | gzip > /backups/bitelogs_$(date +\%Y\%m\%d).sql.gz
```

## Scaling Considerations

### Horizontal Scaling

1. Run multiple API instances behind a load balancer
2. Use connection pooling (PgBouncer) for database
3. Move file storage to S3 or similar

### Database Scaling

1. Add read replicas for query distribution
2. Implement caching layer (Redis)
3. Consider database sharding for large datasets

## Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check DATABASE_URL format
   - Verify PostgreSQL is running
   - Check network/firewall rules

2. **JWT verification failed**
   - Ensure JWT_SECRET matches between deployments
   - Check token expiration

3. **File uploads not working**
   - Verify UPLOAD_DIR exists and is writable
   - Check disk space
   - Verify MAX_FILE_SIZE setting

### Debug Mode

Set `LOG_LEVEL=debug` for verbose logging:

```bash
LOG_LEVEL=debug npm start
```
