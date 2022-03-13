import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { config } from "../config";
import { MainERC721 } from "../typechain";

describe("ERC721", () => {
  let erc721Contract: MainERC721;
  let owner: SignerWithAddress,
    acc1: SignerWithAddress,
    acc2: SignerWithAddress;
  beforeEach(async () => {
    [owner, acc1, acc2] = await ethers.getSigners();
    const ERC721 = await ethers.getContractFactory("MainERC721");
    erc721Contract = await ERC721.deploy(
      config.ERC721_NAME,
      config.ERC721_SYMBOL
    );

    await erc721Contract.deployed();
  });

  describe("Mint", () => {
    it("Should mint the ERC721 token", async () => {
      const METADATA = "Qme4DRXBNLmMTuT2A4AhKG5PPWNAEr5FyowFjDjQN4XCQX";
      // This token will have id is equal to 1
      await erc721Contract.mint(owner.address, METADATA);
      expect(await erc721Contract.balanceOf(owner.address)).to.equal(1);
      expect(await erc721Contract.ownerOf(1)).to.equal(owner.address);
      expect(await erc721Contract.tokenURI(1)).to.equal(
        "https://ipfs.io/ipfs/" + METADATA
      );
    });

    it("Should fail if not owner try to mint", async () => {
      const METADATA = "Qme4DRXBNLmMTuT2A4AhKG5PPWNAEr5FyowFjDjQN4XCQX";
      await expect(
        erc721Contract.connect(acc1).mint(owner.address, METADATA)
      ).to.be.revertedWith("You cannot mint tokens");
    });
  });

  describe("Burn", () => {
    it("Should burn token", async () => {
      const METADATA = "Qme4DRXBNLmMTuT2A4AhKG5PPWNAEr5FyowFjDjQN4XCQX";
      await erc721Contract.mint(owner.address, METADATA);

      await erc721Contract.burn(1);
      await expect(erc721Contract.tokenURI(1)).to.be.revertedWith(
        "Token with this id doesn't exist"
      );

      expect(await erc721Contract.balanceOf(owner.address)).to.equal(0);
    });

    it("Should fail if not owner is trying to burn", async () => {
      const METADATA = "Qme4DRXBNLmMTuT2A4AhKG5PPWNAEr5FyowFjDjQN4XCQX";
      await erc721Contract.mint(owner.address, METADATA);

      await expect(erc721Contract.connect(acc1).burn(1)).to.be.revertedWith(
        "You cannot burn tokens"
      );
    });
  });

  describe("Set token URI", () => {
    it("Should fail if sender try to set URI to nonexistent token", async () => {
      await expect(erc721Contract.setTokenURI(2, "new_uri")).to.be.revertedWith(
        "Token with this id doesn't exist"
      );
    });

    it("Should fail if sender doesn't have ADMIN_ROLE in setTokenURI", async () => {
      await expect(
        erc721Contract.connect(acc1).setTokenURI(1, "new_uri")
      ).to.be.revertedWith("Only admin can set token URI");
    });
  });

  describe("Transfer", () => {
    it("Should transfer token", async () => {
      const METADATA = "Qme4DRXBNLmMTuT2A4AhKG5PPWNAEr5FyowFjDjQN4XCQX";
      // This token will have id is equal to 1
      await erc721Contract.mint(owner.address, METADATA);

      await erc721Contract.transferFrom(owner.address, acc1.address, 1);

      expect(await erc721Contract.balanceOf(owner.address)).to.equal(0);
      expect(await erc721Contract.balanceOf(acc1.address)).to.equal(1);
      expect(await erc721Contract.ownerOf(1)).to.equal(acc1.address);
    });

    it("Should transfer if approval or operator are trying token", async () => {
      const METADATA1 = "Qme4DRXBNLmMTuT2A4AhKG5PPWNAEr5FyowFjDjQN4XCQX";
      const METADATA2 = "Qme4DRXBNLmMTuT2A4AhKG5PPWNAEr5FyowFjDjQN4XCQK";
      // This token will have id is equal to 1
      await erc721Contract.mint(owner.address, METADATA1);
      // This token will have id is equal to 2
      await erc721Contract.mint(owner.address, METADATA2);
      expect(await erc721Contract.balanceOf(owner.address)).to.equal(2);
      expect(await erc721Contract.ownerOf(2)).to.equal(owner.address);
      expect(await erc721Contract.tokenURI(2)).to.equal(
        "https://ipfs.io/ipfs/" + METADATA2
      );

      await erc721Contract.setApprovalForAll(acc1.address, true);
      await erc721Contract
        .connect(acc1)
        .transferFrom(owner.address, acc1.address, 1);

      expect(await erc721Contract.balanceOf(owner.address)).to.equal(1);
      expect(await erc721Contract.balanceOf(acc1.address)).to.equal(1);
      expect(await erc721Contract.ownerOf(1)).to.equal(acc1.address);

      await erc721Contract.approve(acc2.address, 2);
      erc721Contract.connect(acc2);
      await erc721Contract["safeTransferFrom(address,address,uint256)"](
        owner.address,
        acc2.address,
        2
      );
      expect(await erc721Contract.balanceOf(acc2.address)).to.equal(1);
      expect(await erc721Contract.balanceOf(owner.address)).to.equal(0);
      expect(await erc721Contract.ownerOf(2)).to.equal(acc2.address);
    });
  });

  describe("Check supports interfaces", () => {
    it("Should return true for IERC165 and IERC721", async () => {
      expect(await erc721Contract.supportsInterface("0x01ffc9a7")).to.equal(
        true
      );
      expect(await erc721Contract.supportsInterface("0xffffffff")).to.equal(
        false
      );
    });
  });
});
