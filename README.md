# NeoRealm - Cyberpunk Roleplay Social Platform

![NeoRealm Terminal Interface](./public/neo-realm-terminal.png)

NeoRealm is a gamified cyberpunk roleplay social platform built with Next.js and Supabase. Users can create characters, interact in a terminal-style chat interface, and engage with a cyberpunk-themed social network.

**Phase 1 (MVP) Complete!** 🎉 - All core functionality has been implemented and deployed.
**Phase 2: Community Growth** - Currently planning enhanced features including multi-channel support, premium features, and community tools.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Supabase Functions](#supabase-functions)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Character Creation**: Users can create unique cyberpunk characters with classes, avatars, and bios
- **Terminal-Style Chat**: Immersive chat interface inspired by classic cyberpunk terminals
- **Roleplay Commands**: Special commands for actions (/me), dice rolls (/roll), and system information (/help)
- **Energy Reaction System**: Users can react to messages with energy points
- **Social Features**: Follow other users and view their profiles
- **Automated Storytelling**: System messages from "The Architect" that enhance the narrative
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) with React Server Components
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: [Supabase](https://supabase.io/) (Database, Authentication, Edge Functions)
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (Frontend), Supabase (Backend)

## Architecture

NeoRealm follows a modern web application architecture:

```
┌─────────────────┐    ┌──────────────────┐
│   Next.js App   │◄──►│  Supabase Auth   │
│  (Frontend)     │    │  (Users)         │
└─────────┬───────┘    └──────────────────┘
          │
          ▼
┌──────────────────┐    ┌──────────────────┐
│ Supabase Client  │◄──►│ Supabase Database│
│ (Data Access)    │    │ (Profiles,       │
└─────────┬───────┘    │  Messages, etc.) │
          │            └──────────────────┘
          ▼
┌──────────────────┐    ┌──────────────────┐
│ Supabase Edge    │◄──►│ Supabase Storage │
│ Functions        │    │ (Avatars)        │
│ (Serverless)     │    │                  │
└──────────────────┘    └──────────────────┘
```

## Development Setup

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Supabase account (free tier available)
- GitHub account (for deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/neo-realm.git
   cd neo-realm
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

For debugging, you can also set:

```env
LOG_LEVEL=debug
```

### Debugging

The application includes a comprehensive logging system and debugging tools:

- **Structured Logging**: All logs are output in structured format for easy parsing
- **Debug Log Viewer**: In development mode, a real-time log viewer is available in the browser
- **API Route Logging**: All API requests and responses are automatically logged
- **Error Tracking**: Full stack traces and context information for all errors

For detailed information about the logging system and debugging tools, see:
- [Logging System Documentation](docs/LOGGING_SYSTEM.md)
- [Debugging Guide](docs/DEBUGGING_GUIDE.md)

## Database Schema

The database consists of four main tables:

1. **Profiles** - User character profiles
2. **Messages** - Chat messages and system notifications
3. **Followers** - User following relationships
4. **Reactions** - Energy reactions to messages

See the full schema in [src/database/schema.sql](src/database/schema.sql)

## Supabase Functions

NeoRealm includes two Supabase Edge Functions that run serverlessly:

### Welcome User Function
- Triggered when a new user signs up
- Sends a welcome message from "The Architect"
- Located in `supabase/functions/welcome-user/`

### Architect Bot Function
- Sends periodic system messages to enhance the narrative
- Runs on a schedule (configured in Supabase)
- Located in `supabase/functions/architect-bot/`

### Deploying Functions

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_ID
   ```

4. Deploy functions:
   ```bash
   supabase functions deploy
   ```

Alternatively, use the provided deployment scripts:
- On Windows: Run `supabase-deploy.bat`
- On macOS/Linux: Run `supabase-deploy.sh`

## Project Structure

```
src/
├── app/                  # Next.js app router pages
│   ├── dashboard/        # User dashboard
│   ├── login/            # Login page
│   ├── profile/          # Profile creation/editing
│   ├── profiles/         # User profiles browsing
│   ├── signup/           # Signup page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main page (terminal chat)
├── components/           # React components
│   ├── terminal/         # Terminal chat components
│   ├── Navigation.tsx    # Navigation component
│   └── ProtectedRoute.tsx# Route protection HOC
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication context
├── database/             # Database schema
│   └── schema.sql        # Database schema definition
├── lib/                  # Utility libraries
│   └── supabaseClient.ts # Supabase client configuration
└── supabase/             # Supabase configuration and functions
    └── functions/        # Edge functions
        ├── architect-bot/
        └── welcome-user/
```

## Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Create a new project on [Vercel](https://vercel.com/)
3. Connect your GitHub repository
4. Set environment variables in Vercel dashboard
5. Deploy!

### Backend (Supabase)

1. Create a new project on [Supabase](https://supabase.io/)
2. Run the database schema from `src/database/schema.sql`
3. Set up authentication
4. Deploy the Edge Functions (see above)

## Project Roadmap

### Phase 1: MVP (Complete ✅)
- User authentication system
- Character profile creation
- Main terminal chat with basic styling
- Basic dice roll and action command functionality
- Follow system for characters
- Simple "Architect" bot with pre-written messages
- Basic energy reaction system

### Phase 2: Community Growth (In Planning 🚧)
- Multiple channels/rooms for different storylines
- Enhanced UI with full cyberpunk theming
- Sound effects and animations
- Basic premium features (additional character slots, custom themes, ad-free experience)
- "Find a Group" system for matching players with Game Masters
- Threaded conversations for complex storylines

### Phase 3: AI Evolution (Future 🔮)
- Gemini API integration for "Architect" bot
- Dynamic narrative generation based on player actions
- Advanced moderation bots
- Community world-building features
- Marketplace for digital assets
- Quest generation system

Detailed planning documents for Phase 2 can be found in the [docs](docs/) directory:
- [Phase 2 Implementation Plan](docs/PHASE_2_PLAN.md)
- [Channels Technical Specification](docs/CHANNELS_TECHNICAL_SPEC.md)
- [Phase 2 Project Management](docs/PHASE_2_PROJECT_MANAGEMENT.md)
5. Configure environment variables

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*NeoRealm - Where your cyberpunk story begins*