import {
  parseEther,
} from "viem";
import { createSmartAccountClient, sendUserOps } from "@derachain/aa-sdk";

import dotenv from "dotenv";
dotenv.config();
 
export const createAccountAndTransferNative = async () => {
  // ----- 1. Create smart account from signer (private key)
  const index = 0; // change index to create new SA
  const smartAccount = await createSmartAccountClient(index, `0x${process.env.PRIVATE_KEY!}`);
  console.log('SA address', await smartAccount.getAccountAddress());
  
  // ------ 2. Transfer native token to different address
  try {
    const transaction = {
      toAddress: "0x9572EA312B275678bFA57aDc2fA7e0705552cea6",
      data: "0x",
      value: parseEther("1").toString(),
    };

    const userOpResponse = await sendUserOps(smartAccount, [transaction]);    
    console.log(`userOpHash ${userOpResponse.userOpHash}`);

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

createAccountAndTransferNative();