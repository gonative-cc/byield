# Native BYield Project - Context for Qwen Code

## Project Overview

The Native BYield project is a dashboard application for Bitcoin Yield Hub and Native `nBTC`. It is a React-based application built with React Router and deployed on Cloudflare Workers. The application connects to both Bitcoin and Sui blockchains, enabling users to interact with the Bitcoin Yield platform through wallet integration.

The app provides functionality for users to buy and sell nBTC (Native Bitcoin), connect wallets for both Bitcoin (via Xverse) and Sui blockchain, manage their balances, and access transaction history. The project leverages modern web technologies including Tailwind CSS, DaisyUI for styling, and follows contemporary React development practices.

The project uses `bun` as the package manager and runtime.
Use `bun` rather than `npm` and `bunx` rather than `npx`.


## Architecture & Technologies

### Frontend Technologies
- **React 19** - Core UI library
- **React Router 7** - Client-side routing with server-side rendering
- **TypeScript** - Type safety. Strict mode enabled
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - UI component library built on Tailwind
- **@mysten/dapp-kit** - Sui blockchain dApp development kit
- **sats-connect** - Bitcoin wallet connection
- **@tanstack/react-query** - Data fetching and state management

### Backend Technologies
- **Cloudflare Workers** - Serverless runtime environment
- **Cloudflare D1** - SQL database built on SQLite
- **Cloudflare KV** - Key-value storage
- **Wrangler CLI** - Cloudflare project management tool

### Key Features
- Bitcoin and Sui wallet integration
- Buy/sell nBTC functionality
- Transaction history viewing
- Responsive UI for different device sizes
- Server-side rendering for SEO and performance
- Dark mode support

## Building and Running

### Prerequisites
- Bun >= v1.2.20 (the project uses Bun instead of Node.js)
- Editor with EditorConfig support
- Prettier for code formatting

### Development Setup
1. Install dependencies:
   ```sh
   bun install
   ```

2. Run the development server:
   ```sh
   bun run dev
   # or:
   bun start
   ```

3. Apply database migrations to local Cloudflare environment:
   ```sh
   bun run db:migrate:local
   ```

### Builds
- Build the application: `bun run build`
- Build for development: `bun run build:dev`
- Deploy to Cloudflare: `bun run deploy`

### Development Commands
- Type checking: `bun run typecheck`
- Code linting: `bun run lint`
- Code formatting: `bun run format`
- Test all: `bun run test`
- Test single file: `vitest run path/to/test.ts`


## Project Structure
```
.
├── app/                    # Application source code
│   ├── components/         # React components
│   ├── config/             # Configuration files
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   ├── pages/              # Page components
│   ├── providers/          # React context providers
│   ├── routes/             # Route-specific components
│   ├── server/             # Server-specific code
│   ├── types/              # TypeScript type definitions
│   ├── util/               # Utility functions
│   ├── entry.server.tsx    # Server-side rendering entry point
│   ├── networkConfig.ts    # Sui blockchain network configuration
│   ├── root.tsx            # Root component
│   ├── routes.ts           # Route configuration
│   ├── tailwind.css        # Tailwind CSS configuration
│   └── vitest.config.ts    # Testing configuration
├── public/                 # Static assets
├── workers/                # Cloudflare Worker code
├── db/                     # Database migrations
├── build/                  # Build output
├── contrib/                # Git hooks and contribution utilities
├── test/                   # Test files
└── ...                     # Configuration files
```

## Development Conventions

### Styling
- Use Tailwind CSS and DaisyUI classes
- Avoid creating new styles; reuse existing ones or update the theme in tailwind.css
- Configure theme in the tailwind.css file
- Avoid unnecessary wrapper components; DaisyUI with a properly configured theme should be sufficient
- Strongly prefer to use Daisy UI classes over granular tailwindcss styling.
- Daisy UI instructions: @daisy-ui-llms.md


### Code Quality
- Use Prettier for code formatting
- Follow ESLint rules for code quality
- Use TypeScript for type safety
- To run the type checker, use:
  ```sh
  bun run typecheck
  ```
- Write tests using Vitest
- Git hooks run on commit to ensure code quality
- There are pre-commit hooks set up to automatically lint and format code. To install the hooks, run:
  ```sh
  bun run prepare
  ```

## Naming Conventions
- **Files**: PascalCase for components (e.g., `ErrorBoundary.tsx`), camelCase for utilities (e.g., `batteries.ts`)
- **Variables**: camelCase (`myVariable`)
- **Functions**: camelCase (`processData()`)
- **Components**: PascalCase (`MyComponent`)
- **Types**: PascalCase (`MyType`)
- **Constants**: UPPER_SNAKE_CASE (`MY_CONSTANT`)

## Imports
- External libraries first, then internal (`~/`) imports
- Group React imports together
- Use named imports unless default is more readable

### Wallet Integration
- The application integrates both Bitcoin wallet (Xverse) and Sui wallet
- Uses the ByieldWalletProvider context for managing wallet connections
- Currently defaults to testnet but can be switched to mainnet when needed

### Database
- Uses Cloudflare D1 for SQL database needs
- Migrations are located in `/db/migrations/`
- To apply migrations to the local Cloudflare environment:
  ```sh
  bun run db:migrate:local
  ```
- To apply migrations to the deployed database:
  ```sh
  bun run db:migrate
  ```
- KV namespace for additional key-value storage needs

## Key Components
- **NavBar**: Navigation component
- **Footer**: Global footer component
- **SideBar**: Sidebar navigation
- **BuyNBTC**: Main page component for buying and selling nBTC
- **ByieldWalletProvider**: Context provider for managing Bitcoin and Sui wallet connections
- **NBTCBalance**: Component for displaying nBTC balance
- **ErrorBoundary**: Error handling component

## Environment and Configuration
- Uses Wrangler for Cloudflare development and deployment
- Multiple environments: local, dev, and prod configurations
- D1 database connections for different environments
- KV namespaces for different environments
- Environment-specific configurations in wrangler.jsonc
- Whenever `wrangler.toml` is changed, you need to regenerate types:
  ```sh
  bun run cf-typegen
  ```

## Testing
- Use vitest with globals enabled (`describe`, `it`, `expect`)
- Simple assertion style (`expect(result).toBe(expected)`)
- Test utility functions, not complex UI components
