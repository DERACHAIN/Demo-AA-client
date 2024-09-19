# Demo AA Client
The Demo client project for Darechain Account Abstraction feature, powered by [Biconomy Client SDK](https://docs.biconomy.io/quickstart-react)

## Prerequisites
- NodeJS v20 LTS

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





