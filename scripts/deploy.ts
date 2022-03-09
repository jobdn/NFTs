import { ethers } from "hardhat";
import { config } from "../config";

async function main() {
  const ERC721 = await ethers.getContractFactory("ERC721");
  const erc721 = await ERC721.deploy(config.ERC721_NAME, config.ERC721_SYMBOL);

  await erc721.deployed();

  console.log("ERC721 deployed to:", erc721.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
