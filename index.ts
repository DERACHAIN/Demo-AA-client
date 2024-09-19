import {
  createWalletClient,
  http,
  parseEther,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygonAmoy, avalancheFuji } from "viem/chains";
import { createSmartAccountClient, Bundler, createECDSAOwnershipValidationModule, PaymasterMode } from "@biconomy/account";

import { defineChain } from 'viem';

import dotenv from "dotenv";
import { parse } from "path";
dotenv.config();
 
const darechain_testnet = defineChain({
  id: parseInt(process.env.CHAIN_ID!),
  name: 'DERACHAIN (Testnet)',
  nativeCurrency: {
    decimals: 18,
    name: 'DERA',
    symbol: 'DERA',
  },
  rpcUrls: {
    default: {
      http: [process.env.RPC_URL!],
      // TODO: webSocket: [process.env.WSS_URL!],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://trace.derachain.com' },
  },
})

const bundlerUrl = process.env.BUNDLER_URL!;
 
export const createAccountAndMintNft = async () => {
  // ----- 1. Generate EOA from private key
  const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY!}`);
  const client = createWalletClient({
    account,
    chain: darechain_testnet,
    transport: http(process.env.RPC_URL!),
    //chain: avalancheFuji,
    //transport: http(),
    
  });
  const eoa = client.account.address;
  console.log(`EOA address: ${eoa}`);
 
  // ------ 2. Create biconomy smart account instance
  const bundler = new Bundler({
    customChain: darechain_testnet,
    entryPointAddress: process.env.ENTRY_POINT_ADDRESS! as `0x${string}`,
    bundlerUrl,
  });

  const validateModule = await createECDSAOwnershipValidationModule({
    moduleAddress: process.env.ECDSA_MODULE_ADDRESS! as `0x${string}`,
    signer: client,
  });
  
  // DERA_TESTNET
  const smartAccount = await createSmartAccountClient({
    customChain: darechain_testnet,
    factoryAddress: process.env.SMART_ACCOUNT_FACTORY_ADDRESS! as `0x${string}`,
    implementationAddress: process.env.SMART_ACCOUNT_IMPLEMENTATION_ADDRESS! as `0x${string}`,
    defaultFallbackHandler: process.env.FACTORY_CALLBACK_HANDLER_ADDRESS! as `0x${string}`,
    defaultValidationModule: validateModule,
    bundler,
    signer: client,
    chainId: parseInt(process.env.CHAIN_ID!),
    entryPointAddress: process.env.ENTRY_POINT_ADDRESS! as `0x${string}`,
    index: 0, // TODO: change index to create new SA    
  });

  // AVAX_FUJI
  // const smartAccount = await createSmartAccountClient({    
  //   signer: client,
  //   index: 1,
  //   bundlerUrl,
  //   paymasterUrl: process.env.PAYMASTER_URL!,
  // });

  console.log('SA address', await smartAccount.getAccountAddress());
  
  // ------ 3. Transfer native token to different address
  try {
    const userOpResponse = await smartAccount.sendTransaction({
      to: "0x9572EA312B275678bFA57aDc2fA7e0705552cea6",
      data: "0x",
      value: parseEther("1"),
    });
    
    console.log(`user op response`, userOpResponse);

    const {transactionHash} = await userOpResponse.waitForTxHash();
    console.log("transactionHash", transactionHash);
    const userOpReceipt = await userOpResponse.wait();

    if (userOpReceipt.success == "true") {
      console.log("UserOp receipt", userOpReceipt);
      console.log("Transaction receipt", userOpReceipt.receipt);
    } else{
      console.log("UserOp failed", userOpReceipt)
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Transaction Error:", error.message);
    }
  }
};

createAccountAndMintNft();