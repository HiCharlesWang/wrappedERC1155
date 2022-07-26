const { expect } = require('chai');
const { ethers } = require('hardhat');

let owner, addr1, erc1155Factory

describe("Token contract", () =>{
    beforeEach(async () =>{
        [owner, addr1, _] = await ethers.getSigners();
        mockFactory = await ethers.getContractFactory('mock');
        mockDeployed = await mockFactory.deploy("paladinsec.co");
        erc1155Factory = await ethers.getContractFactory('wrappedToken');
        erc1155Deployed = await erc1155Factory.deploy(mockDeployed.address);
        await mockDeployed.mint(owner.address, 500);
    });

    describe("deployment", () =>{
        it("Should set the correct underlying token", async() =>{
            expect(await erc1155Deployed.underlyingToken()).to.equal(mockDeployed.address);
        })
        it("Should set the correct balance for the mock token", async() =>{
            expect(await mockDeployed.balanceOf(owner.address, 0)).to.equal(500);
        })
        it("Should set the correct URI", async() =>{
            expect(await erc1155Deployed.uri(0)).to.equal("paladinsec.io");
        })
    })
    describe("Deposit function",() =>{
        it("Should transfer the token to the contract and increase the amount", async() =>{
            await mockDeployed.setApprovalForAll(erc1155Deployed.address, true);
            await erc1155Deployed.deposit(200);
            expect(await mockDeployed.balanceOf(owner.address, 0)).to.equal(500-200)
            expect(await mockDeployed.balanceOf(erc1155Deployed.address, 0)).to.equal(200)
            expect(await erc1155Deployed.balanceOf(owner.address, 0)).to.equal(200);
        })
    })
    describe("Withdraw function", () =>{
        it("Should transfer the token to the owner and decrease the amount", async() =>{
            await mockDeployed.setApprovalForAll(erc1155Deployed.address, true);
            await erc1155Deployed.deposit(200);
            await erc1155Deployed.withdraw(200);
            expect(await erc1155Deployed.balanceOf(owner.address, 0)).to.equal(0);
            expect(await mockDeployed.balanceOf(owner.address, 0)).to.equal(500);
            expect(await mockDeployed.balanceOf(erc1155Deployed.address, 0)).to.equal(0);
        })
    })
})