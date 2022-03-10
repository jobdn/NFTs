import { ethers } from "hardhat";
import { config } from "../config";

async function main() {
  const CarsERC1155 = await ethers.getContractFactory("CarsERC1155");
  const carsERC1155 = await CarsERC1155.deploy();

  await carsERC1155.deployed();

  console.log("CarsERC1155 deployed to:", carsERC1155.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
