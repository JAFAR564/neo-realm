# NeoRealm Development Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed on your system:

1. **Node.js** (v18 or higher)
2. **npm** (v9 or higher) or **yarn** (v1.22 or higher)
3. **Git**
4. **Supabase CLI** (optional but recommended)
5. **GitHub CLI** (optional but recommended)

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/neo-realm.git
cd neo-realm
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Using yarn:
```bash
yarn install
```

Using pnpm:
```bash
pnpm install
```

## Environment Configuration

### 1. Create Environment File

Create a `.env.local` file in the root directory of the project:

```bash
touch .env.local
```

### 2. Configure Environment Variables

Add the following variables to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

To get these values:
1. Create a Supabase account at [https://supabase.io](https://supabase.io)
2. Create a new project
3. Navigate to Project Settings > API
4. Copy the Project URL and anon key

## Supabase Setup

### 1. Install Supabase CLI

```bash
npm install -g supabase
# or
yarn global add supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link Your Project

```bash
supabase link --project-ref YOUR_PROJECT_ID
```

### 4. Apply Database Schema

```bash
supabase db push
```

Alternatively, you can manually run the schema from `src/database/schema.sql` in your Supabase SQL editor.

## Running the Development Server

### Start the Development Server

Using npm:
```bash
npm run dev
```

Using yarn:
```bash
yarn dev
```

Using pnpm:
```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Build for Production

Using npm:
```bash
npm run build
```

Using yarn:
```bash
yarn build
```

Using pnpm:
```bash
pnpm build
```

### Start Production Server

Using npm:
```bash
npm run start
```

Using yarn:
```bash
yarn start
```

Using pnpm:
```bash
pnpm start
```

## Project Structure

```
neo-realm/
├── docs/                    # Documentation files
├── public/                  # Static assets
├── src/                     # Source code
│   ├── app/                 # Next.js app router
│   ├── components/          # React components
│   ├── contexts/            # React contexts
│   ├── database/            # Database schema
│   ├── lib/                 # Utility libraries
│   └── supabase/            # Supabase functions
├── .env.local              # Environment variables
├── .gitignore              # Git ignore file
├── next.config.ts          # Next.js configuration
├── package.json            # Project dependencies
├── postcss.config.mjs      # PostCSS configuration
├── README.md               # Project README
├── tailwind.config.mjs     # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Development Workflow

### 1. Create a New Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Edit files as needed for your feature or bug fix.

### 3. Test Your Changes

Run the development server and test your changes locally:
```bash
npm run dev
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "Description of your changes"
```

### 5. Push to GitHub

```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request

Go to your GitHub repository and create a pull request.

## Supabase Functions Development

### 1. Local Development

To test Supabase functions locally:

```bash
supabase functions serve
```

This will start a local server for your functions at `http://localhost:54321`.

### 2. Deploy Functions

To deploy your functions to Supabase:

```bash
supabase functions deploy
```

Or use the provided scripts:
- Windows: `supabase-deploy.bat`
- macOS/Linux: `supabase-deploy.sh`

## Code Quality and Formatting

### ESLint

To check for code issues:
```bash
npm run lint
```

To automatically fix issues:
```bash
npm run lint -- --fix
```

### TypeScript

To check for TypeScript errors:
```bash
npx tsc --noEmit
```

## Testing

### Running Tests

To run tests:
```bash
npm run test
```

### Writing Tests

Tests should be placed in the `__tests__` directory alongside the files they test.

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure your `.env.local` file is in the root directory
   - Restart the development server after adding new environment variables

2. **Supabase Connection Errors**
   - Verify your Supabase URL and anon key are correct
   - Check that your Supabase project is not paused

3. **Database Schema Issues**
   - Ensure all tables are created with the correct schema
   - Check that Row Level Security (RLS) policies are properly configured

4. **Authentication Problems**
   - Verify that email confirmation is working (if enabled)
   - Check the Supabase Auth settings in your project dashboard

### Getting Help

If you encounter issues:
1. Check the console for error messages
2. Review the documentation in the `docs/` directory
3. Search existing issues on GitHub
4. Create a new issue if needed

## Contributing

Please read our [CONTRIBUTING.md](CONTRIBUTING.md) file for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.