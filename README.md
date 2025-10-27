<!-- markdownlint-disable MD013 -->

# Native BYield

Dashboard for the Bitcoin Yield Hub and Native `nBTC`.

## Development

### Dependencies

- bun >= v1.2.20
- proper EditorConfig mode setup in your editor!
- `prettier` to format the code.

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

To apply migrations to the local Cloudflare env:

```sh
bun run db:migrate:local
```

### Local env variables

Copy and update env example:

```sh
cp .env.example .env
```

## Contributing

Participating in open source is often a highly collaborative experience. We’re encouraged to create in public view, and we’re incentivize to welcome contributions of all kinds from people around the world.

Check out [contributing repo](https://github.com/gonative-cc/contributig) for our guidelines & policies for how to contribute. Note: we require DCO! Thank you to all those who have contributed!

After cloning the repository, **make sure to run `make setup-hooks`.**

Run `bun run prepare` to install git hooks that will run on commit and code push.

You will need to rerun typegen whenever you make changes to `wrangler.toml`.

```sh
bun run cf-typegen
```

### Styling

We are using [Tailwind CSS](https://tailwindcss.com/) and [DaisyUI](https://daisyui.com):

- Don't create new styles.
- Try to reuse the styles or update the theme in tailwind.css file.
- Avoid creating unnecessary wrappers or components. DaisyUI with a properly configure theme should be enough.

See also the [Vite docs on css](https://vitejs.dev/guide/features.html#css).

## Security

See [contributing repo](https://github.com/gonative-cc/contributig) for reporting security vulnerability or sharing a security feedback.
