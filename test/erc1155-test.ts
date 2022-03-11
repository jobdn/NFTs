import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { config } from "../config";
import { CarsERC1155 } from "../typechain";

describe("ERC721", () => {
  let erc1155Contract: CarsERC1155;
  let owner: SignerWithAddress,
    acc1: SignerWithAddress,
    acc2: SignerWithAddress;
  beforeEach(async () => {
    [owner, acc1, acc2] = await ethers.getSigners();
    const ERC1155 = await ethers.getContractFactory("CarsERC1155");
    erc1155Contract = await ERC1155.deploy(config.ERC1155_URI);

    await erc1155Contract.deployed();
  });

  describe("Mint", () => {
    it("Should mint tokens with different uri", async () => {
      await erc1155Contract.mint(1, 1, "uri_for_first_nft");
      expect(await erc1155Contract.balanceOf(owner.address, 1)).to.equal(1);
      expect(await erc1155Contract.uri(1)).to.equal("uri_for_first_nft");

      await erc1155Contract.mint(2, 100, "uri_for_ft");
      expect(await erc1155Contract.balanceOf(owner.address, 2)).to.equal(100);
      expect(await erc1155Contract.uri(2)).to.equal("uri_for_ft");
    });

    it("Should mintBatch tokens", async () => {
      await erc1155Contract.mintBatch(
        [1, 2, 3, 100],
        [100, 200, 30, 1000],
        "batch_uri"
      );

      expect(
        await erc1155Contract.balanceOfBatch(
          [owner.address, owner.address],
          [1, 100]
        )
      ).to.eql([BigNumber.from("100"), BigNumber.from("1000")]);
      expect(await erc1155Contract.balanceOf(owner.address, 2)).to.equal(200);
    });
  });
  describe("Burn", () => {
    it("Should burn token", async () => {
      await erc1155Contract.mint(1, 1, "uri_for_first_nft");
      await erc1155Contract.mint(2, 10, "uri_for_ft");
      await erc1155Contract.burn(owner.address, 1, 1);
      await erc1155Contract.burn(owner.address, 2, 5);
      expect(await erc1155Contract.balanceOf(owner.address, 1)).to.equal(0);
      expect(await erc1155Contract.balanceOf(owner.address, 2)).to.equal(5);
    });

    it("Should fail if sender try to burn not his tokens", async () => {
      await erc1155Contract.mint(1, 1, "uri_for_first_nft");
      await expect(
        erc1155Contract.connect(acc1).burn(owner.address, 1, 1)
      ).to.be.revertedWith("You cannot burn tokens of 'from'");
    });

    it("Should burn token", async () => {
      await erc1155Contract.mint(1, 1, "uri_for_first_nft");
      await erc1155Contract.mint(2, 10, "uri_for_ft");
      await erc1155Contract.burn(owner.address, 1, 1);
      await erc1155Contract.burn(owner.address, 2, 5);
      expect(await erc1155Contract.balanceOf(owner.address, 1)).to.equal(0);
      expect(await erc1155Contract.balanceOf(owner.address, 2)).to.equal(5);
    });
  });

  describe("Burn batch", () => {
    it("Should burn tokens batch", async () => {
      await erc1155Contract.mintBatch(
        [1, 2, 3, 100],
        [100, 200, 30, 1000],
        "batch_uri"
      );
      await erc1155Contract.burnBatch(owner.address, [1, 3], [100, 30]);
      expect(
        await erc1155Contract.balanceOfBatch(
          [owner.address, owner.address],
          [1, 3]
        )
      ).to.eql([BigNumber.from("0"), BigNumber.from("0")]);
    });

    it("Should fail if not owner try to burn tokens batch", async () => {
      await erc1155Contract.mintBatch(
        [1, 2, 3, 100],
        [100, 200, 30, 1000],
        "batch_uri"
      );
      await expect(
        erc1155Contract.connect(acc1).burnBatch(owner.address, [1, 3], [100, 30])
      ).to.be.revertedWith("You cannot burn tokens batch of 'from'");
    });
  });
});
