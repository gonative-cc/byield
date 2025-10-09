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

## Contributing

Participating in open source is often a highly collaborative experience. We’re encouraged to create in public view, and we’re incentivize to welcome contributions of all kinds from people around the world.

Check out [contributing repo](https://github.com/gonative-cc/contributig) for our guidelines & policies for how to contribute. Note: we require DCO! Thank you to all those who have contributed!

After cloning the repository, **make sure to run `make setup-hooks`.**

### Development

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

## Transaction Failures

### nBTC Minting Failures

If your nBTC minting transaction fails after Bitcoin confirmation, here's what you need to know:

#### What Happened
- Your BTC was successfully broadcasted, mined and confirmed on the Bitcoin network
- The Sui network failed to mint your nBTC tokens
- Your BTC is currently held in our deposit address - **your funds are safe**

#### Why This Happens
This failure occurs on the Sui blockchain side, usually due to:
- Network congestion on Sui
- SPV Light Client synchronization issues
- Temporary connectivity problems between Bitcoin and Sui networks

#### Resolution Process
1. **Automatic Retry**: The system will automatically attempt to re-mint your nBTC tokens
2. **Wait Period**: If the problem persists after a few hours, manual intervention may be required
3. **Support Form**: Fill out our [resolution form](https://forms.example.com/nbtc-resolution) for manual processing
4. **Support Team**: Our team will process your request and mint your nBTC tokens manually

#### Other Transaction Issues

**Broadcast Failures**: If your Bitcoin transaction fails to broadcast, your BTC was never sent and remains in your wallet.

**Blockchain Reorganizations**: If your transaction was included in a block that's no longer part of the heaviest chain due to a Bitcoin reorg, the transaction may need to be resubmitted.

For any transaction issues, contact our support team through the resolution form.

## Security

See [contributing repo](https://github.com/gonative-cc/contributig) for reporting security vulnerability or sharing a security feedback.
