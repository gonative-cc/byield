<!-- markdownlint-disable MD013 -->

# Native BYield

Dashboard for the Bitcoin Yield Hub and Native `nBTC`.

## Development

### Dependencies

- node >= v22
- pnpm >= 10.11
- proper editorconfig mode setup in your editor!

### Quick Start

- 📖 [Remix docs](https://remix.run/docs)
- 📖 [Remix Cloudflare docs](https://remix.run/guides/vite#cloudflare)

Run the dev server (using wrangler cloudflare framework as a backend):

```sh
# firstly install the latest dependencies
pnpm install
pnpm run dev
```

Running:

```sh
pnpm run build
pnpm start
```

To apply migrations to the local cloudflare env:

```sh
pnpm run db:migrate:local
```

## Typegen

Generate types for your Cloudflare bindings in `wrangler.toml`:

```sh
pnpm run typegen
```

You will need to rerun typegen whenever you make changes to `wrangler.toml`.

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever css framework you prefer. See the [Vite docs on css](https://vitejs.dev/guide/features.html#css) for more information.
