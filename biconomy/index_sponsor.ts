import { BigNumber, ethers } from "ethers";
import {
  Hex,
  createWalletClient,
  encodeFunctionData,
  http,
  parseAbi,
  zeroAddress,
} from "viem";
import { BiconomySmartAccountV2, createSmartAccountClient, Bundler, createECDSAOwnershipValidationModule, PaymasterMode, BiconomyPaymaster,
          ECDSAOwnershipValidationModule, IHybridPaymaster, SponsorUserOperationDto } from "@biconomy/account";


import { defineChain } from 'viem';

import dotenv from "dotenv";
dotenv.config({ path: '../.env' });

export const createAccountAndMintNft = async () => {
  // custom chain definition
  const darechain = defineChain({
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

  // ----- 1. Generate EOA from private key
  let provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL!);
  let signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  const eoa = await signer.getAddress();
  console.log(`EOA address: ${eoa}`);

  // create bundler and paymaster instances
  const bundler = new Bundler({
    customChain: darechain,
    bundlerUrl: process.env.BUNDLER_URL!,
    chainId: parseInt(process.env.CHAIN_ID!),
    entryPointAddress: process.env.ENTRY_POINT_ADDRESS!,
  });

  const paymaster = new BiconomyPaymaster({
    paymasterUrl: process.env.PAYMASTER_URL!,
  });

  const ecdsaModule = await ECDSAOwnershipValidationModule.create({
    signer: signer,
    moduleAddress: process.env.ECDSA_MODULE_ADDRESS! as `0x${string}`,
  })

  // Biconomy smart account config
  // Note that paymaster and bundler are optional. You can choose to create new instances of this later and make account API use 
  const biconomySmartAccountConfig = {
    customChain: darechain,
    factoryAddress: process.env.SMART_ACCOUNT_FACTORY_ADDRESS! as `0x${string}`,
    implementationAddress: process.env.SMART_ACCOUNT_IMPLEMENTATION_ADDRESS! as `0x${string}`,
    defaultFallbackHandler: process.env.FACTORY_CALLBACK_HANDLER_ADDRESS! as `0x${string}`,
    signer: signer,
    chainId: parseInt(process.env.CHAIN_ID!),
    rpcUrl: process.env.RPC_URL!,
    paymaster: paymaster, 
    bundler: bundler, 
    entryPointAddress: process.env.ENTRY_POINT_ADDRESS! as `0x${string}`,
    defaultValidationModule: ecdsaModule,
    activeValidationModule: ecdsaModule,
    index: 15, // TODO: change index to create new SA
  };

  // create biconomy smart account instance
  const smartAccount = await BiconomySmartAccountV2.create(biconomySmartAccountConfig);
  console.log('SA address', await smartAccount.getAccountAddress());
  
  // ------ 3. Transfer native token to different address
  try {
    // create sponsored gasless transaction
    const nftAddress = process.env.FREEMINT_COLLECTION_ADDRESS!;
    const parsedAbi = parseAbi(["function mint(address to, uint256 id)"]);
    const callData = encodeFunctionData({
      abi: parsedAbi,
      functionName: "mint",
      args: [await smartAccount.getAccountAddress() as Hex, BigNumber.from(0).toBigInt()],
    });

    const transaction = {
      to: nftAddress,
      data: callData,
    };

    const userOpResponse = await smartAccount.sendTransaction(transaction, {
      paymasterServiceData: { 
        mode: PaymasterMode.SPONSORED,
        calculateGasLimits: false,
      },
    });

    console.log(`userOp Hash: ${userOpResponse.userOpHash}`);

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