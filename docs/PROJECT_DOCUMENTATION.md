# NeoRealm Project Documentation

## Overview

NeoRealm is a gamified cyberpunk roleplay social platform that combines social networking with immersive storytelling. Users create unique cyberpunk characters and interact in a terminal-style chat interface, complete with special commands, energy reactions, and narrative elements.

## Core Features

### 1. Character System
- Users create detailed profiles with:
  - Unique username
  - Character class (e.g., NetRunner, Corporate, Street Samurai)
  - Avatar/bio
- Profiles are stored in the `profiles` table in the database

### 2. Terminal Chat Interface
- Immersive terminal-style UI inspired by cyberpunk aesthetics
- Real-time messaging with Supabase realtime subscriptions
- Different message types:
  - Regular chat messages
  - Action messages (/me command)
  - Dice rolls (/roll command)
  - System messages from "The Architect"

### 3. Roleplay Commands
- `/me [action]` - Perform an action in third person
- `/roll [XdY]` - Roll dice (e.g., 1d20, 2d6)
- `/help` - Display available commands

### 4. Energy Reaction System
- Users can react to messages with energy points
- Visual feedback for reactions
- Stored in the `reactions` table

### 5. Social Features
- Follow other users
- View user profiles
- See character information in chat

### 6. Narrative Elements
- Automated system messages from "The Architect"
- Periodic story updates
- Immersive cyberpunk world-building

## Technical Implementation

### Authentication Flow
1. Users sign up or log in through Supabase Auth
2. New users are redirected to profile creation
3. Existing users with profiles go directly to the chat
4. Session management through React Context

### Data Flow
1. Frontend communicates with Supabase via the JavaScript client
2. Realtime subscriptions for instant message updates
3. Edge Functions handle server-side logic
4. Database triggers and CRON jobs for automated features

### UI Components
- TerminalChat: Main chat interface
- EnergyReaction: Reaction system component
- Navigation: App navigation
- ProtectedRoute: Route protection HOC
- AuthContext: Authentication state management

## Database Schema

The application uses four main tables:

### Profiles Table
Stores user character information:
- id (UUID, primary key, references auth.users)
- username (unique text)
- avatar_url (text)
- character_class (text)
- bio (text)
- created_at (timestamp)

### Messages Table
Stores all chat and system messages:
- id (BIGINT, primary key)
- user_id (UUID, references profiles)
- content (text)
- message_type (chat, action, dice_roll, system)
- created_at (timestamp)

### Followers Table
Stores following relationships:
- id (BIGINT, primary key)
- follower_id (UUID, references profiles)
- following_id (UUID, references profiles)
- created_at (timestamp)

### Reactions Table
Stores energy reactions to messages:
- id (BIGINT, primary key)
- user_id (UUID, references profiles)
- message_id (BIGINT, references messages)
- reaction_type (text)
- created_at (timestamp)

## Supabase Functions

### Welcome User Function
Triggered when a new user signs up, sends a personalized welcome message from "The Architect" to the chat.

### Architect Bot Function
Periodically sends system messages to enhance the narrative atmosphere. These messages contain world-building elements and story updates.

## Development Guidelines

### Code Structure
- Follow Next.js App Router conventions
- Use TypeScript for type safety
- Component-based architecture
- Context API for state management
- Utility functions in the `lib/` directory

### Styling
- Tailwind CSS for styling
- Cyberpunk color palette (neon greens, cyans, purples)
- Responsive design principles
- Terminal-inspired UI elements

### Testing
- Unit tests for utility functions
- Integration tests for database operations
- End-to-end tests for critical user flows

## Deployment

### Environment Variables
Required environment variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

### Build Process
1. Next.js build optimizes the frontend
2. Supabase functions deployed separately
3. Database schema applied through Supabase dashboard or CLI

## Future Enhancements

### Planned Features
1. Character inventory system
2. Quests and missions
3. Private messaging
4. Character customization options
5. Leaderboards and achievements
6. Voice chat integration
7. Virtual locations/rooms
8. Item trading system

### Technical Improvements
1. Enhanced moderation tools
2. Better performance optimization
3. Offline support
4. Push notifications
5. Advanced analytics
6. Multi-language support