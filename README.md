# Demo AA Client
The Demo client project for Darechain Account Abstraction feature, powered by [DERA AA SDK](https://www.npmjs.com/package/@derachain/aa-sdk)

## Prerequisites
- [NodeJS v20 LTS](https://nodejs.org/en/blog/release/v20.9.0)

## Setup
- Install npm packages
```bash
$ npm i
```
- Create `.env` file from template `.env.example`, populate EOA private key, bundler endpoint url, AA contracts, etc.

## Run
- User sponsored tx
```bash
$ npx ts-node index.ts
```

- Paymaster sponsored tx
```bash
$ npx ts-node index_sponsor.ts
```

## Test
- TBA





