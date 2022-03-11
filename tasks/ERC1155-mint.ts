import { task } from "hardhat/config";
import { config } from "../config";

task("mintERC1155", "Mint your ERC721 token for owner and metadata")
  .addParam("id", "Id for creating token")
  .addParam("amount", "amount of tokens")
  .addParam("metadata", "Metadata for token")
  .setAction(async (taskArgs, hre) => {
    const { id, amount, metadata } = taskArgs;
    const [owner] = await hre.ethers.getSigners();

    const erc1155 = await hre.ethers.getContractAt(
      "CarsERC1155",
      config.ERC1155
    );

    await erc1155.mint(id, amount, metadata);
    console.log(
      `${owner.address} minted token with ${id} id and ${metadata} metadata`
    );
  });
