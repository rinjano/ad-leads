````markdown
# Lead Management System

A comprehensive lead management system built with Next.js, Prisma, and PostgreSQL.

## 🚀 Getting Started

### Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📊 Database Management

### Backup Database

Create a backup of your database:

```bash
npm run db:backup
```

This will create a timestamped SQL file in the `backups/` folder.

### Restore Database

List available backups:
```bash
npm run db:restore
```

Restore from a specific backup:
```bash
npm run db:restore backup-2025-10-19T12-30-45.sql
```

### Auto Backup

Run automated backup with logging:
```bash
npm run db:auto-backup
```

For more details, see [BACKUP_RESTORE.md](./BACKUP_RESTORE.md)

## 📚 Documentation

- [Backup & Restore Guide](./BACKUP_RESTORE.md) - Complete guide for database backup and restore
- [Implementation Guide](./IMPLEMENTATION_README.md) - Feature implementation details
- [Quick Start Guide](./QUICK_START.md) - Quick setup and usage guide

## 🔐 Default Credentials

**Admin Account:**
- Email: `admin@demo.com`
- Password: `demo123`

## 🛠️ Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:seed` - Seed master data
- `npm run db:backup` - Backup database
- `npm run db:restore` - Restore database
- `npm run db:auto-backup` - Automated backup with logging

## 📦 Tech Stack

- **Framework:** Next.js 15.5.4 with Turbopack
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Authentication:** NextAuth.js with Supabase
- **UI:** React 19, Tailwind CSS, Radix UI
- **State Management:** TanStack Query

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

````
