import { task } from "hardhat/config";
import { config } from "../config";

task("mint", "Mint your ERC721 token for owner and metadata")
  .addParam("owner", "Owner who owned of token")
  .addParam("metadata", "Metadata for token")
  .setAction(async (taskArgs, hre) => {
    const { owner, metadata } = taskArgs;

    const erc721 = await hre.ethers.getContractAt("MainERC721", config.ERC721);

    const tokenId = await (await erc721.mint(owner, metadata)).wait();
    console.log(`${tokenId}`);
    const ownerBalance = await erc721.balanceOf(owner);
    console.log(`${owner} minted token with ${tokenId} id`);
  });
