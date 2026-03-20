# 🚀 ScanApp - Quick Start

## Start Everything

```bash
# 1. Start Backend + Database
npm run docker:up

# 2. Start Mobile App (in another terminal)
npm run dev:mobile
```

## Useful Commands

### Docker
- `npm run docker:up` - Start backend + database
- `npm run docker:down` - Stop all services
- `npm run docker:logs` - View all logs
- `npm run docker:clean` - Stop and remove all data

### Development
- `npm run dev:mobile` - Start mobile app
- `npm run dev:backend` - Start backend (without Docker)

### Database
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Prisma Studio

## URLs

- **Backend API**: http://localhost:3000
- **Database**: localhost:5432
- **Prisma Studio**: http://localhost:5555 (after `npm run db:studio`)

## First Time Setup

```bash
# Install dependencies
npm install
npm run setup:workspace

# Generate Prisma client
cd packages/backend
npx prisma generate

# Start everything
cd ../..
npm run docker:up
npm run dev:mobile
```

See [README.md](README.md) for full documentation.
