# FormForge

A modern, intuitive, zero-code form builder SaaS built with Next.js 16, TypeScript, Tailwind CSS, and Supabase.

## Features

- 🎨 Drag-and-drop form builder
- 📝 Multiple field types (text, email, long text, checkbox, radio, divider)
- 🔒 Secure authentication with Supabase
- 📊 View and manage form submissions
- 🔗 Share forms via unique slugs
- 💾 Auto-save functionality
- 📤 CSV export for submissions
- ⚡ Built with Next.js 16 and React 19

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **Database/Auth**: Supabase
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Drag & Drop**: @dnd-kit

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A Supabase account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd formforge
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. Set up Supabase database:
   - Create a new Supabase project
   - Run the SQL schema from `supabase-schema.sql` in the Supabase SQL Editor
   - This will create the necessary tables and RLS policies

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses three main tables:

- **forms**: Stores form metadata
- **form_fields**: Stores form field definitions
- **submissions**: Stores form submissions

All tables have Row Level Security (RLS) enabled for data protection.

## Project Structure

```
/
├── app/
│   ├── (auth)/          # Authentication routes
│   ├── (dashboard)/     # Protected dashboard routes
│   ├── form/            # Public form routes
│   ├── api/             # API routes
│   └── layout.tsx       # Root layout
├── components/
│   ├── auth/            # Authentication components
│   ├── builder/         # Form builder components
│   ├── dashboard/       # Dashboard components
│   ├── public/          # Public form components
│   ├── shared/          # Shared components
│   └── ui/              # Shadcn/ui components
├── lib/
│   ├── supabase/        # Supabase client utilities
│   ├── store/           # Zustand stores
│   ├── utils/           # Utility functions
│   ├── validations/     # Zod validation schemas
│   ├── types.ts         # TypeScript types
│   └── constants.ts     # Constants
└── supabase-schema.sql  # Database schema
```

## Features Implementation

### Form Builder
- Drag-and-drop field ordering
- Real-time preview
- Auto-save with debouncing
- Field duplication
- Keyboard shortcuts (Cmd+S to save)

### Public Forms
- ISR for performance
- Dynamic form rendering
- Rate limiting (10 submissions/hour per IP)
- Customizable thank you messages

### Submissions
- View all submissions
- Search and filter
- CSV export
- Individual submission details
- Stats summary

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The application will automatically detect Next.js and deploy.

### Environment Variables for Production

Make sure to set all environment variables in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` (your production URL)

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.