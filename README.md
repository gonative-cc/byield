<!-- markdownlint-disable MD013 -->

# Native BYield

Dashboard for the Bitcoin Yield Hub and Native `nBTC`.

## Development

### Dependencies

- bun >= v1.2.20
- proper editorconfig mode setup in your editor!

Note: we use Bun instead of Node.js for JS and TS execution and package management.

### Quick Start

- 📖 [React Router docs](https://reactrouter.com/home)

Run the dev server (using wrangler Cloudflare framework as a backend):

```sh
# firstly install the latest dependencies
bun install
```

Running:

```sh
bun run dev
# or:
bun start
```

To apply migrations to the local cloudflare env:

```sh
bun run db:migrate:local
```

## Typegen

Generate types for your Cloudflare bindings in `wrangler.toml`:

```sh
bun run typegen
```

You will need to rerun typegen whenever you make changes to `wrangler.toml`.

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever css framework you prefer. See the [Vite docs on css](https://vitejs.dev/guide/features.html#css) for more information.
