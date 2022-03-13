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
      await erc1155Contract.mint(
        1,
        1,
        ethers.utils.toUtf8Bytes("uri_for_first_nft")
      );
      expect(await erc1155Contract.balanceOf(owner.address, 1)).to.equal(1);
      expect(await erc1155Contract.uri(1)).to.equal("uri_for_first_nft");
    });

    it("Should fail if sender has not role MINTER_ROLE in mint", async () => {
      await expect(
        erc1155Contract
          .connect(acc1)
          .mint(1, 1, ethers.utils.toUtf8Bytes("uri_for_first_nft"))
      ).to.be.revertedWith("You cannot mint tokens");
    });

    // BATCH
    it("Should fail if length of id doen't match to length of datas ", async () => {
      await expect(
        erc1155Contract.mintBatch(
          [1, 2, 3, 100],
          [100, 200, 30, 1000],
          [
            ethers.utils.toUtf8Bytes("batch_uri_1"),
            ethers.utils.toUtf8Bytes("batch_uri_2"),
            // Error
            ethers.utils.toUtf8Bytes("batch_uri_4"),
          ]
        )
      ).to.be.revertedWith(
        "ids length, datas length and amounts length must mutch"
      );
    });

    it("Should mintBatch tokens", async () => {
      await erc1155Contract.mintBatch(
        [1, 2, 3, 100],
        [100, 200, 30, 1000],
        [
          ethers.utils.toUtf8Bytes("batch_uri_1"),
          ethers.utils.toUtf8Bytes("batch_uri_2"),
          ethers.utils.toUtf8Bytes("batch_uri_3"),
          ethers.utils.toUtf8Bytes("batch_uri_4"),
        ]
      );

      expect(
        await erc1155Contract.balanceOfBatch(
          [owner.address, owner.address],
          [1, 100]
        )
      ).to.eql([BigNumber.from("100"), BigNumber.from("1000")]);
      expect(await erc1155Contract.balanceOf(owner.address, 2)).to.equal(200);
      expect(await erc1155Contract.uri(2)).to.equal("batch_uri_2");
    });

    it("Should fail if sender has not role MINTER_ROLE in mintBatch", async () => {
      await expect(
        erc1155Contract
          .connect(acc1)
          .mintBatch(
            [1, 2],
            [10, 20],
            [ethers.utils.toUtf8Bytes("uri_for_first_nft")]
          )
      ).to.be.revertedWith("You cannot mint tokens");
    });

    // it ("Should fail if sendrt has not MINTER_ROLE")
  });
  describe("Burn", () => {
    it("Should burn token", async () => {
      await erc1155Contract.mint(
        1,
        1,
        ethers.utils.toUtf8Bytes("uri_for_first_nft")
      );
      await erc1155Contract.mint(2, 10, ethers.utils.toUtf8Bytes("uri_for_ft"));

      await erc1155Contract.burn(owner.address, 1, 1);
      expect(await erc1155Contract.balanceOf(owner.address, 1)).to.equal(0);
      expect(await erc1155Contract.uri(1)).to.equal("");

      await erc1155Contract.burn(owner.address, 2, 5);
      expect(await erc1155Contract.balanceOf(owner.address, 2)).to.equal(5);
      expect(await erc1155Contract.uri(2)).to.equal("uri_for_ft");

      await erc1155Contract.burn(owner.address, 2, 5);
      expect(await erc1155Contract.balanceOf(owner.address, 2)).to.equal(0);
      expect(await erc1155Contract.uri(2)).to.equal("");
    });

    it("Should fail if sender has no BURNER_ROLE in burh method", async () => {
      await expect(
        erc1155Contract.connect(acc1).burn(owner.address, 1, 1)
      ).to.be.revertedWith("You cannot burn tokens");
    });

    // BATCH
    it("Should burn tokens batch", async () => {
      await erc1155Contract.mintBatch(
        [1, 2, 3, 100],
        [100, 200, 30, 1000],
        [
          ethers.utils.toUtf8Bytes("batch_uri"),
          ethers.utils.toUtf8Bytes("batch_uri"),
          ethers.utils.toUtf8Bytes("batch_uri"),
          ethers.utils.toUtf8Bytes("batch_uri"),
        ]
      );
      await erc1155Contract.burnBatch(owner.address, [1, 3], [100, 30]);
      expect(
        await erc1155Contract.balanceOfBatch(
          [owner.address, owner.address],
          [1, 3]
        )
      ).to.eql([BigNumber.from("0"), BigNumber.from("0")]);
    });

    it("Should fail if sender has no BURNER_ROLE in burnBatch", async () => {
      await erc1155Contract.mintBatch(
        [1, 2, 3, 100],
        [100, 200, 30, 1000],
        [
          ethers.utils.toUtf8Bytes("batch_uri"),
          ethers.utils.toUtf8Bytes("batch_uri"),
          ethers.utils.toUtf8Bytes("batch_uri"),
          ethers.utils.toUtf8Bytes("batch_uri"),
        ]
      );
      await expect(
        erc1155Contract
          .connect(acc1)
          .burnBatch(owner.address, [1, 3], [100, 30])
      ).to.be.revertedWith("You cannot burn tokens");
    });

    it("Should fail if ids and amounts length mismatch", async () => {
      await expect(
        erc1155Contract.burnBatch(owner.address, [1, 3], [30])
      ).to.be.revertedWith("ERC1155: ids and amounts length mismatch");
    });
  });

  describe("Check supports interfaces", () => {
    it("Should return true for IERC165 and IERC721", async () => {
      expect(await erc1155Contract.supportsInterface("0x01ffc9a7")).to.equal(
        true
      );
      expect(await erc1155Contract.supportsInterface("0xffffffff")).to.equal(
        false
      );
    });
  });
});
