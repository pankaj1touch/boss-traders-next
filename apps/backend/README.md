# EdTech Platform - Backend API

Node.js + Express backend for the EdTech platform.

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file (copy from `env.example`):
   ```bash
   cp env.example .env
   ```

   Or use the interactive setup wizard:
   ```bash
   npm run setup:email
   ```

   Required environment variables:
   ```env
   NODE_ENV=development
   PORT=4000
   MONGODB_URI=your_mongodb_uri
   JWT_ACCESS_SECRET=your_secret
   JWT_REFRESH_SECRET=your_secret
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your_gmail_app_password
   CLIENT_URL=http://localhost:3000
   ```

   **⚠️ Important:** For Gmail, you MUST use an App Password, not your regular password.
   See [EMAIL_SETUP_GUIDE.md](./EMAIL_SETUP_GUIDE.md) for detailed instructions.

3. Test email configuration (optional but recommended):
   ```bash
   npm run test:email
   ```

4. Seed database:
   ```bash
   npm run seed
   ```

5. Start server:
   ```bash
   npm run dev
   ```

## API Endpoints

- Health: `GET /health`
- Auth: `/api/auth/*`
- Courses: `/api/courses/*`
- Live Sessions: `/api/live/*`
- Orders: `/api/orders/*`
- eBooks: `/api/ebooks/*`

See main README for full API documentation.

