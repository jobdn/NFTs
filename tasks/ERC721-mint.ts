import { task } from "hardhat/config";
import { config } from "../config";

task("mintERC721", "Mint your ERC721 token for owner and metadata")
  .addParam("owner", "Owner who owned of token")
  .addParam("metadata", "Metadata for token")
  .setAction(async (taskArgs, hre) => {
    const { owner, metadata } = taskArgs;

    const erc721 = await hre.ethers.getContractAt("MainERC721", config.ERC721);

    await erc721.mint(owner, metadata);
    console.log(`${owner} minted token`);
  });
