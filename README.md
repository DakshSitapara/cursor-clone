# Cursor Clone

An AI-powered code editor inspired by Cursor, featuring intelligent code assistance, live preview, and seamless project management.

![Cursor Clone](/logo.svg)

## Features

### Core Capabilities

- **AI-Powered Coding Assistant** - Intelligent code generation, modification, and explanations using advanced AI models
- **Live Preview** - Real-time preview of your web applications with integrated terminal
- **Project Management** - Create, import from GitHub, and export projects effortlessly
- **File Explorer** - Intuitive tree view for managing project files and folders
- **Code Editor** - Syntax highlighting, minimap, and intelligent suggestions
- **Conversation History** - Track and manage your AI conversations with context preservation

### AI Tools

The AI assistant can perform various operations on your project:

- Read files and analyze code
- Create new files and folders
- Update existing files
- Delete files and folders
- Rename files
- Scrape URLs for context
- Generate conversation titles automatically

### Developer Experience

- **Keyboard Shortcuts** - Quick access to common actions
  - `⌘K` / `Ctrl+K` - Open command dialog
  - `⌘J` / `Ctrl+J` - Create new project
  - `⌘I` / `Ctrl+I` - Import from GitHub
- **Dark/Light Mode** - Full theme support
- **Responsive Design** - Works on desktop and tablet devices

## Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible UI components
- **Monaco Editor** - Code editing with VS Code features
- **Allotment** - Resizable split panes
- **Lucide Icons** - Consistent icon set

### Backend & Services

- **Convex** - Backend database and real-time sync
- **Inngest** - Background job processing and workflows
- **Clerk** - Authentication and user management
- **WebContainer** - Secure browser-based code execution
- **Vercel Analytics** - Performance monitoring

### AI Integration

- **OpenRouter API** - Access to multiple AI models
- **GLM-4.7-Flash** - Fast, efficient AI model for code assistance
- **Inngest Agent Kit** - Multi-agent AI workflows

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm/bun
- A Convex account (free tier works)
- An OpenRouter API key
- A Clerk account for authentication

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd cursor-clone
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=your-convex-url
CURSOR_CLONE_CONVEX_INTERNAL_KEY=your-internal-key

# OpenRouter (AI)
OPENROUTER_API_KEY=your-openrouter-api-key

# Clerk (Authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key

# Inngest
INNGEST_EVENT_KEY=your-inngest-event-key
INNGEST_SIGNING_KEY=your-inngest-signing-key

# Optional: Vercel Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

4. Initialize Convex:

```bash
npx convex dev
```

5. Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/             # Reusable UI components
│   ├── ai-elements/        # AI-related components
│   └── ui/                 # shadcn/ui components
├── features/               # Feature-specific modules
│   ├── auth/              # Authentication
│   ├── conversations/     # AI chat functionality
│   ├── editor/            # Code editor
│   ├── preview/           # Live preview
│   └── projects/          # Project management
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
└── inngest/              # Background jobs
```

## Key Features Explained

### AI Coding Assistant

The AI assistant uses a sophisticated multi-agent system powered by Inngest:

- **Title Generator** - Automatically creates meaningful conversation titles
- **Coding Agent** - Handles file operations and code generation
- **Tool System** - Extensible tools for various operations

### Live Preview

Projects are previewed using WebContainer, providing:

- Isolated execution environment
- Real-time updates
- Integrated terminal
- Customizable build commands

### Project Management

- **Create** - Start new projects from scratch
- **Import** - Clone GitHub repositories
- **Export** - Push changes back to GitHub
- **Settings** - Configure build and dev commands

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL | Yes |
| `CURSOR_CLONE_CONVEX_INTERNAL_KEY` | Convex internal API key | Yes |
| `OPENROUTER_API_KEY` | OpenRouter API key for AI | Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | Yes |
| `INNGEST_EVENT_KEY` | Inngest event key | Yes |
| `INNGEST_SIGNING_KEY` | Inngest signing key | Yes |

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Inspired by [Cursor](https://cursor.sh)
- Built with [Next.js](https://nextjs.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- AI powered by [OpenRouter](https://openrouter.ai)

## Support

For issues and questions, please open an issue on GitHub.
