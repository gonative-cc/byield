# GEMINI.md

## Project Overview

This project is a dashboard for the Bitcoin Yield Hub and Native `nBTC`. It's a modern web application built with [React](https://react.dev/) and [TypeScript](https://www.typescriptlang.org/), using [Vite](https://vitejs.dev/) for fast development and builds. The UI is styled with [Tailwind CSS](https://tailwindcss.com/) and the [DaisyUI](https://daisyui.com/) component library. The application is designed to be deployed on [Cloudflare Pages](https://pages.cloudflare.com/) and utilizes Cloudflare Workers for server-side logic, as indicated by the `wrangler.jsonc` configuration.

The project uses `bun` as the package manager and runtime.
Use `bun` rather than `npm` and `bunx` rather than `npx`.

## Building and Running

### Prerequisites

- [bun](https://bun.sh/) >= v1.2.20


### Installation

```sh
bun install
```

### Development

To run the development server:

```sh
bun run dev
```

or

```sh
bun start
```

This will start the application with hot-reloading, leveraging Vite and the Cloudflare development server.

### Building

To build the application for production:

```sh
bun run build
```

### Deployment

The application is deployed to Cloudflare. There are different commands for deploying to production:

```sh
# Deploy to production
bun run deploy:prod
```

### Testing

To run the test suite:

```sh
bun test
```

## Development Conventions

### Styling

- **Tailwind CSS** and **DaisyUI** are used for styling.
- Developers should reuse existing styles and themes from `tailwind.css`.
- Avoid creating new styles.
- Avoid unnecessary wrapper components.
- Strongly prefer to use Daisy UI classes over granular tailwindcss styling.
- Daisy UI instructions: @daisy-ui-llms.txt

### Linting and Formatting

- The project uses **ESLint** for linting and **Prettier** for code formatting.
- There are pre-commit hooks set up to automatically lint and format code. To install the hooks, run:
  ```sh
  bun run prepare
  ```

### Type Checking

- The project uses **TypeScript** for static type checking.
- To run the type checker, use:
  ```sh
  bun run typecheck
  ```

### Cloudflare Type Generation

- Whenever `wrangler.toml` is changed, you need to regenerate types:
  ```sh
  bun run cf-typegen
  ```

### Database Migrations

- The project uses Cloudflare D1 for its database.
- To apply migrations to the local Cloudflare environment:
  ```sh
  bun run db:migrate:local
  ```
- To apply migrations to the deployed database:
  ```sh
  bun run db:migrate
  ```
