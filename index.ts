import {
  parseEther,
} from "viem";
import { createSmartAccountClient } from "@derachain/aa-sdk";

import dotenv from "dotenv";
dotenv.config();
 
export const createAccountAndMintNft = async () => {
  // ----- 1. Create smart account from signer (private key)
  const smartAccount = await createSmartAccountClient(0, `0x${process.env.PRIVATE_KEY!}`, 'testnet');

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