<div align="center">

# Cursor Clone

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

An AI-powered code editor inspired by Cursor, featuring intelligent code assistance, live preview, and seamless project management.

[Live Demo](https://cursor-clone-beige.vercel.app) • [Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Architecture](#-architecture) • [Contributing](#-contributing)

</div>

---

## Features

### Core Capabilities

- **AI-Powered Coding Assistant** - Intelligent code generation, modification, and explanations using advanced AI models
- **Live Preview** - Real-time preview of your web applications with integrated terminal using WebContainer
- **Project Management** - Create, import from GitHub, and export projects effortlessly
- **File Explorer** - Intuitive tree view for managing project files and folders
- **Code Editor** - Syntax highlighting, minimap, and intelligent suggestions powered by CodeMirror 6
- **Conversation History** - Track and manage your AI conversations with context preservation

### AI Tools

The AI assistant can perform various operations on your project:

- Read files and analyze code
- Create new files and folders
- Update existing files
- Delete files and folders
- Rename files
- Scrape URLs for context using Firecrawl
- Generate conversation titles automatically

### Developer Experience

- **Keyboard Shortcuts** - Quick access to common actions
  - `⌘K` / `Ctrl+K` - Open command dialog
  - `⌘J` / `Ctrl+J` - Create new project
  - `⌘I` / `Ctrl+I` - Import from GitHub
- **Dark/Light Mode** - Full theme support with next-themes
- **Responsive Design** - Works on desktop and tablet devices
- **Error Tracking** - Integrated Sentry monitoring

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| [Next.js 16.1.6](https://nextjs.org/) | React framework with App Router |
| [TypeScript 5](https://www.typescriptlang.org/) | Type-safe development |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com/) | Beautiful, accessible UI components |
| [CodeMirror 6](https://codemirror.net/) | Code editing with VS Code features |
| [Allotment](https://github.com/bvaughn/allotment) | Resizable split panes |
| [Lucide Icons](https://lucide.dev/) | Consistent icon set |
| [Radix UI](https://www.radix-ui.com/) | Headless UI primitives |

### Backend & Services

| Technology | Purpose |
|------------|---------|
| [Convex](https://www.convex.dev/) | Backend database and real-time sync |
| [Inngest](https://inngest.com/) | Background job processing and workflows |
| [Clerk](https://clerk.com/) | Authentication and user management |
| [WebContainer API](https://webcontainer.io/) | Secure browser-based code execution |
| [Vercel Analytics](https://vercel.com/analytics) | Performance monitoring |
| [Sentry](https://sentry.io/) | Error tracking and performance |

### AI Integration

| Technology | Purpose |
|------------|---------|
| [Vercel AI SDK](https://sdk.vercel.ai/) | AI model integration |
| [Google AI](https://ai.google.dev/) | AI model provider |
| [Groq](https://groq.com/) | Fast AI inference |
| [Inngest Agent Kit](https://inngest.com/) | Multi-agent AI workflows |
| [Firecrawl](https://www.firecrawl.dev/) | Web scraping for AI context |

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm/yarn/pnpm/bun
- A [Convex](https://www.convex.dev/) account (free tier works)
- A [Clerk](https://clerk.com/) account for authentication
- An [Inngest](https://inngest.com/) account for background jobs
- API keys for Google AI and/or Groq

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/DakshSitapara/cursor-clone.git
cd cursor-clone
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=your-convex-url
CURSOR_CLONE_CONVEX_INTERNAL_KEY=your-internal-key

# Clerk (Authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key

# Inngest
INNGEST_EVENT_KEY=your-inngest-event-key
INNGEST_SIGNING_KEY=your-inngest-signing-key

# AI Providers (choose one or both)
GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-key
GROQ_API_KEY=your-groq-key

# Optional: Vercel Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id

# Optional: Sentry
SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token
```

4. **Initialize Convex**

```bash
npx convex dev
```

This will start the Convex development server and sync your schema.

5. **Start the development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

6. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

---

## Architecture

### Project Structure

```
src/
├── app/                          # Next.js app router
│   ├── api/                      # API routes
│   │   ├── messages/            # Chat message handling
│   │   ├── github/              # GitHub import/export
│   │   ├── projects/            # Project creation
│   │   ├── quick-edit/          # AI quick edit
│   │   └── suggestion/          # AI suggestions
│   └── projects/[projectId]/    # Project pages
├── components/
│   ├── ui/                       # 60+ shadcn/ui components
│   ├── ai-elements/             # AI-related UI elements
│   └── providers.tsx             # App providers
├── features/
│   ├── auth/                     # Authentication views
│   ├── conversations/            # Chat/conversation feature
│   ├── editor/                   # Code editor with CodeMirror
│   ├── preview/                  # WebContainer preview
│   └── projects/                 # Project management
├── hooks/                        # Custom React hooks
├── lib/                          # Utilities
├── inngest/                      # Background job functions
└── instrumentation.ts           # Sentry setup

convex/                           # Convex backend
├── auth.ts                      # Authentication
├── conversations.ts             # Chat data
├── files.ts                     # File storage
├── projects.ts                  # Project data
└── schema.ts                    # Database schema
```

### Key Components

#### AI Coding Assistant

The AI assistant uses a sophisticated multi-agent system powered by Inngest:

- **Title Generator** - Automatically creates meaningful conversation titles
- **Coding Agent** - Handles file operations and code generation
- **Tool System** - Extensible tools for various operations

#### Live Preview

Projects are previewed using WebContainer, providing:

- Isolated execution environment
- Real-time updates
- Integrated terminal with xterm.js
- Customizable build and dev commands

#### Project Management

- **Create** - Start new projects from scratch
- **Import** - Clone GitHub repositories using Octokit
- **Export** - Push changes back to GitHub
- **Settings** - Configure build and dev commands

---

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL | Yes |
| `CURSOR_CLONE_CONVEX_INTERNAL_KEY` | Convex internal API key | Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | Yes |
| `INNGEST_EVENT_KEY` | Inngest event key | Yes |
| `INNGEST_SIGNING_KEY` | Inngest signing key | Yes |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI API key | Yes* |
| `GROQ_API_KEY` | Groq API key | Yes* |
| `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` | Vercel Analytics ID | No |
| `SENTRY_DSN` | Sentry DSN | No |
| `SENTRY_AUTH_TOKEN` | Sentry auth token | No |

*At least one AI provider key is required

---

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add all required environment variables
4. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

### Docker

```bash
docker build -t cursor-clone .
docker run -p 3000:3000 cursor-clone
```

---

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

### Code Style

This project uses ESLint with Next.js configuration. Please run `npm run lint` before committing.

---

## Troubleshooting

### Convex Connection Issues

If you encounter Convex connection errors:

1. Ensure `npx convex dev` is running
2. Check your `NEXT_PUBLIC_CONVEX_URL` in `.env.local`
3. Verify your Convex internal key

### AI Not Responding

If the AI assistant is not working:

1. Check your AI provider API keys
2. Verify you have credits available on your AI provider account
3. Check the browser console for errors

### WebContainer Not Loading

If the preview is not loading:

1. Ensure you're using a modern browser (Chrome, Firefox, Edge)
2. Check for browser extensions that might block WebContainer
3. Verify your build and dev commands are correct

---

## Roadmap

- [ ] Multi-file editing support
- [ ] Git integration (commit, branch, merge)
- [ ] Custom AI model configuration
- [ ] Collaboration features
- [ ] Plugin system
- [ ] Mobile app

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run linting (`npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Inspired by [Cursor](https://cursor.sh)
- Built with [Next.js](https://nextjs.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- AI powered by [Vercel AI SDK](https://sdk.vercel.ai)
- Icons by [Lucide](https://lucide.dev)

---

## Support

For issues, questions, or contributions:

- Open an issue on [GitHub Issues](https://github.com/DakshSitapara/cursor-clone/issues)
- Start a discussion in [GitHub Discussions](https://github.com/DakshSitapara/cursor-clone/discussions)

---

<div align="center">

Made with ❤️ by [DakshSitapara](https://github.com/DakshSitapara)

</div>
