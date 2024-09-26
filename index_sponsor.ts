import { BigNumber, ethers } from "ethers";
import {
  Hex,
  createWalletClient,
  encodeFunctionData,
  http,
  parseAbi,
  zeroAddress,
} from "viem";
import { createSmartAccountClient, sendUserOps } from "@derachain/aa-sdk";

import dotenv from "dotenv";
dotenv.config();

export const createAccountAndMintNft = async () => {
  // create biconomy smart account instance
  const isPaymaster = true;
  const index = 0; // change index to create new SA
  const smartAccount = await createSmartAccountClient(index, `0x${process.env.PRIVATE_KEY!}`);
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
      toAddress: nftAddress,
      data: callData,
    };

    const userOpReceipt = await sendUserOps(smartAccount, [transaction], isPaymaster);

    // const userOpResponse = await smartAccount.sendTransaction(transaction, {
    //   paymasterServiceData: { 
    //     mode: PaymasterMode.SPONSORED,
    //     calculateGasLimits: false,
    //   },
    // });

    console.log(`userOp Hash: ${userOpReceipt.userOpHash}`);
    // const {transactionHash} = await userOpResponse.waitForTxHash();
    console.log(`transactionHash:  ${userOpReceipt.receipt.transactionHash}`);
    // const userOpReceipt = await userOpResponse.wait();

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