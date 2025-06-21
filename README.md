# TenantFlow Frontend

A modern CRM SaaS frontend built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- 🔐 Authentication & Authorization
- 📊 Dashboard with Analytics
- 👥 Client Management
- 📈 Lead Management
- 🔄 Follow-up System
- 🤖 AI-Powered Insights
- 📱 Responsive Design
- 🎨 Modern UI/UX

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Authentication**: Supabase Auth
- **State Management**: React Context
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts

## Prerequisites

- Node.js v18 or higher
- Supabase account
- Backend API running (see backend README)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tenantflow-frontend.git
   cd tenantflow-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp env.example .env.local
   ```
   Edit `.env.local` with your configuration:
   ```env
   # API Configuration
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
   
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   
   # App Configuration
   NEXT_PUBLIC_APP_NAME=TenantFlow CRM
   NEXT_PUBLIC_APP_VERSION=1.0.0
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Troubleshooting

### Authentication Issues
- Ensure Supabase configuration is correct
- Check that backend API is running on the correct port
- Verify CORS settings in backend match frontend URL

### API Connection Issues
- Check `NEXT_PUBLIC_API_BASE_URL` in environment variables
- Ensure backend server is running
- Check network connectivity

### Build Issues
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
app/
├── (protected)/    # Protected routes
├── globals.css     # Global styles
├── layout.tsx      # Root layout
└── page.tsx        # Home page

components/
├── ui/             # Reusable UI components
├── dashboard/      # Dashboard components
├── landing/        # Landing page components
└── layout/         # Layout components

lib/
├── api.ts          # API client
├── auth.ts         # Auth utilities
├── supabase.ts     # Supabase client
└── utils.ts        # Utility functions

context/
└── auth-context.tsx # Authentication context
```

## Authentication Flow

1. User signs up/logs in via Supabase Auth
2. Frontend receives Supabase session
3. Frontend authenticates with backend API using Supabase token
4. Backend validates token and returns user data
5. Frontend stores user state and API token

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 