# foundryup

[foundry](https://github.com/foundry-rs/foundry) binaries on npm

## Install

This package follows [foundryup's nightly releases](https://github.com/foundry-rs/foundry/releases), so you can install the latest nightly with:

```
npm install foundryup
```

Or a specific nightly release with:

```
npm install foundryup@0.2.0-nightly.c631cf3
```

## Usage

```json
{
  "scripts": {
    "build": "forge build"
  },
  "devDependencies": {
    "foundryup": "0.2.0-nightly.c631cf3"
  }
}
```

```
% npm forge --version

forge 0.2.0 (c631cf3 2024-02-18T00:17:43.475108000Z)
```

## Troubleshooting

#### GLIBC errors on Vercel

```
/vercel/path0/node_modules/.pnpm/foundryup@0.2.0-nightly.c631cf3/node_modules/foundryup/bin/foundry/linux_amd64/forge: /lib64/libm.so.6: version `GLIBC_2.27' not found (required by /vercel/path0/node_modules/.pnpm/foundryup@0.2.0-nightly.c631cf3/node_modules/foundryup/bin/foundry/linux_amd64/forge)
```

You can resolve this by [changing your Vercel app's Node.JS version](https://vercel.com/docs/functions/runtimes/node-js#node.js-version) to `20.x`.
