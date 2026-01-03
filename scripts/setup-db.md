# Database Setup Instructions

## Fixing Prisma Generation Error

If you encounter the error:
```
EPERM: operation not permitted, unlink '...query_engine-windows.dll.node'
```

This happens because the Next.js dev server has locked the Prisma client files.

### Solution:

1. **Stop the dev server** (Ctrl+C in the terminal running `npm run dev`)

2. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

3. **Create and apply migration:**
   ```bash
   npx prisma migrate dev --name add_auth_and_votes
   ```

4. **Restart the dev server:**
   ```bash
   npm run dev
   ```

### Alternative (if migration fails):

If you need to reset the database:
```bash
npx prisma migrate reset
npx prisma migrate dev
```

## Environment Variables

Create a `.env` file in the root directory with:

```env
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your-secret-key-for-production"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

**Note:** For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an "App Password" (not your regular password)
3. Use that app password in `SMTP_PASS`

In development mode, if SMTP is not configured, OTPs will be:
- Logged to the console
- Returned in the API response (visible in the signup page)

