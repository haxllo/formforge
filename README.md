# FormForge

A modern, powerful, zero-code form builder SaaS built with Next.js 16, TypeScript, Tailwind CSS, and Supabase. The Tally.so alternative with advanced features.

## ✨ Features

### Form Builder
- 🎨 **Intuitive drag-and-drop interface** with categorized field palette
- 🎯 **18+ field types**: text, email, number, phone, URL, date, long text, checkbox, radio, dropdown, rating, matrix, ranking, picture choice, signature, file upload, dividers, and page breaks
- 📋 **Conditional logic**: Show/hide fields based on user responses
- 🔄 **Field duplication and reordering**
- 💾 **Auto-save** with keyboard shortcuts (Cmd/Ctrl+S)
- 🎨 **Visual and text editing modes**

### Theming & Customization
- 🎨 **5 pre-built themes**: Default, Minimal, Modern, Playful, Professional
- 🖌️ **Custom theming**: Colors, fonts, button styles, backgrounds
- 📐 **Multiple layouts**: Single column, two-column, card style
- 🖼️ **Logo upload and branding control**
- 🎨 **Custom CSS support**
- 📊 **Progress bar option**

### Advanced Field Types
- 📊 **Matrix questions**: Multi-dimensional rating scales
- 🔢 **Ranking**: Drag-to-order preference lists
- 🖼️ **Picture choice**: Image-based selections
- ✍️ **Signature capture**: Electronic signatures
- 📄 **Page breaks**: Multi-page forms

### Form Management
- 🔒 **Secure authentication** with Supabase
- 📊 **Submission management** with search and filters
- 📤 **CSV export** for data analysis
- 🔗 **Share forms** via unique slugs
- 🌐 **Public form publishing**
- 🎯 **Form status** (draft/published)

### Security & Anti-Spam
- 🛡️ **Honeypot protection**
- ⏱️ **Rate limiting** (10 submissions/hour per IP)
- 🔐 **Row Level Security (RLS)**
- 🍯 **Bot detection**

### Developer Experience
- ⚡ **Built with Next.js 16** and React 19
- 📱 **Fully responsive design**
- 🎯 **TypeScript** for type safety
- 🎨 **Tailwind CSS** + Shadcn/ui components
- 📦 **Zustand** for state management
- ✅ **Zod** for validation
- 🔄 **ISR** (Incremental Static Regeneration) for performance

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