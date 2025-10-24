# Smart Exam Scheduler

An intelligent exam scheduling application built with React, TypeScript, and Supabase. This application helps educational institutions manage exam schedules efficiently with AI-powered assistance.

## Features

- **Exam Management**: Add and manage exam details including course codes, names, and student counts
- **Room Management**: Configure available rooms with capacity information
- **Timeslot Management**: Define available time slots for scheduling
- **Automatic Scheduling**: Intelligent algorithm to optimize exam scheduling
- **AI Chat Assistant**: Get help with scheduling queries using OpenAI integration
- **Data Import/Export**: Support for CSV and Excel file formats
- **PDF Reports**: Generate and export schedule reports
- **User Authentication**: Secure user management with Supabase Auth

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: shadcn/ui, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **AI Integration**: OpenAI API
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation
- **State Management**: TanStack Query

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd exam-scheduler
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with your Supabase and OpenAI credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

4. Start the development server:
```bash
npm run dev
```

## Database Setup

Run the SQL migrations in the `supabase/migrations` directory to set up the database schema.

## Deployment

This project can be deployed to any static hosting service like Vercel, Netlify, or AWS S3. Make sure to configure the environment variables in your deployment platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request
