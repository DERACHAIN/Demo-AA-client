import { BigNumber } from "ethers";
import { Hex, encodeFunctionData, parseAbi } from "viem";
import { createSmartAccountClient, sendUserOps } from "@derachain/aa-sdk";

import dotenv from "dotenv";
dotenv.config();

export const createAccountAndMintNft = async () => {
  // 1. Create Smart Account from signer (private key)
  const isPaymaster = true;
  const index = 0; // change index to create new SA
  const smartAccount = await createSmartAccountClient(
    index,
    `0x${process.env.PRIVATE_KEY!}`
  );
  console.log("SA address", await smartAccount.getAccountAddress());

  // ------ 2. Mint NFT to Smart Account
  try {
    // create sponsored gasless transaction
    const nftAddress = process.env.FREEMINT_COLLECTION_ADDRESS!;
    const parsedAbi = parseAbi(["function mint(address to, uint256 id)"]);
    const callData = encodeFunctionData({
      abi: parsedAbi,
      functionName: "mint",
      args: [
        (await smartAccount.getAccountAddress()) as Hex,
        BigNumber.from(0).toBigInt(),
      ],
    });

    const transaction = {
      toAddress: nftAddress,
      data: callData,
    };

    const userOpResponse = await sendUserOps(
      smartAccount,
      [transaction],
      isPaymaster
    );
    console.log(`userOpHash: ${userOpResponse.userOpHash}`);

    const { transactionHash } = await userOpResponse.waitForTxHash();
    console.log(`transactionHash:  ${transactionHash}`);

    const userOpReceipt = await userOpResponse.wait();
    if (userOpReceipt.success == "true") {
      console.log("UserOp receipt", userOpReceipt);
      console.log("Transaction receipt", userOpReceipt.receipt);
    } else {
      console.log("UserOp failed", userOpReceipt);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Transaction Error:", error.message);
    }
  }
};

createAccountAndMintNft();
