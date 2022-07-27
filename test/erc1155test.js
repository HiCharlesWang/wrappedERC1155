const { expect } = require('chai');
const { ethers } = require('hardhat');

let owner, addr1, erc1155Factory

describe("Token contract", () =>{
    beforeEach(async () =>{
        [owner, addr1, _] = await ethers.getSigners();
        mockFactory = await ethers.getContractFactory('ERC20Mock');
        mockDeployed = await mockFactory.deploy(owner.address);
        await mockDeployed.mint(owner.address, 500);
        erc1155Factory = await ethers.getContractFactory('wrappedToken');
        erc1155Deployed = await erc1155Factory.deploy();
        mockFactory2 = await ethers.getContractFactory('ERC20Mock');
        mockDeployed2 = await mockFactory.deploy(owner.address);
        await mockDeployed2.mint(owner.address, 500);
        wrappedTokenHashFactory = await ethers.getContractFactory('wrappedTokenHash');
        wrappedTokenHashDeployed = await wrappedTokenHashFactory.deploy();
    });

    describe("deployment", () =>{
        it("Should set the correct balance for the mock token", async() =>{
            expect(await mockDeployed.balanceOf(owner.address)).to.equal(500);
        })
    })
    describe("Deposit function",() =>{
        it("Should transfer the token to the contract and increase the amount", async() =>{
            await mockDeployed.approve(erc1155Deployed.address, 20000);
            await erc1155Deployed.deposit(200, mockDeployed.address);
            expect(await mockDeployed.balanceOf(owner.address)).to.equal(500-200)
            expect(await mockDeployed.balanceOf(erc1155Deployed.address)).to.equal(200)
            expect(await erc1155Deployed.balanceOf(owner.address, erc1155Deployed.counterForToken(mockDeployed.address))).to.equal(200);
            await mockDeployed2.approve(erc1155Deployed.address, 20000);
            await erc1155Deployed.deposit(200, mockDeployed2.address);
            expect(await mockDeployed2.balanceOf(erc1155Deployed.address)).to.equal(200);
            expect(await mockDeployed2.balanceOf(owner.address)).to.equal(500-200);
            expect(await erc1155Deployed.balanceOf(owner.address, erc1155Deployed.counterForToken(mockDeployed2.address))).to.equal(200);
        })
    })
    describe("Withdraw function", () =>{
        it("Should transfer the token to the owner and decrease the amount", async() =>{
            await mockDeployed.approve(erc1155Deployed.address, 200);
            await erc1155Deployed.deposit(200, mockDeployed.address);
            expect(await mockDeployed.balanceOf(owner.address)).to.equal(500-200)
            expect(await mockDeployed.balanceOf(erc1155Deployed.address)).to.equal(200)
            expect(await erc1155Deployed.balanceOf(owner.address, erc1155Deployed.counterForToken(mockDeployed.address))).to.equal(200);
            await erc1155Deployed.withdraw(200, mockDeployed.address);
            expect(await erc1155Deployed.balanceOf(owner.address, erc1155Deployed.counterForToken(mockDeployed.address))).to.equal(0);
            expect(await mockDeployed.balanceOf(owner.address)).to.equal(500);
            expect(await mockDeployed.balanceOf(erc1155Deployed.address)).to.equal(0);
        })
        it("Deploy another mock and try to withdraw with the first mock", async() =>{
            await mockDeployed.approve(erc1155Deployed.address, 200);
            await erc1155Deployed.deposit(200, mockDeployed.address);
            expect(await mockDeployed.balanceOf(owner.address)).to.equal(500-200)
            expect(await mockDeployed.balanceOf(erc1155Deployed.address)).to.equal(200)
            expect(await erc1155Deployed.balanceOf(owner.address, erc1155Deployed.counterForToken(mockDeployed.address))).to.equal(200);
            await expect(erc1155Deployed.withdraw(100, mockDeployed2.address)).to.be.revertedWith("You do not have enough tokens staked")
        })
    })
    // NEW VERSION
    describe("Hash contract tests", () =>{
        it("Deposit should adjust all necessary balances ", async() =>{
            await mockDeployed.approve(wrappedTokenHashDeployed.address, 20000);
            await wrappedTokenHashDeployed.deposit(200, mockDeployed.address);
            expect(await mockDeployed.balanceOf(wrappedTokenHashDeployed.address)).to.equal(200);
            expect(await mockDeployed.balanceOf(owner.address)).to.equal(500-200);
            expect(await wrappedTokenHashDeployed.balanceOfToken(owner.address, mockDeployed.address)).to.equal(200)
        })
        it("Should revert withdraw for other tokens", async() =>{
            await mockDeployed.approve(wrappedTokenHashDeployed.address, 20000);
            await wrappedTokenHashDeployed.deposit(200, mockDeployed.address);
            expect(await mockDeployed.balanceOf(wrappedTokenHashDeployed.address)).to.equal(200);
            expect(await mockDeployed.balanceOf(owner.address)).to.equal(500-200);
            expect(await wrappedTokenHashDeployed.balanceOfToken(owner.address,mockDeployed.address)).to.equal(200)
            await expect(wrappedTokenHashDeployed.withdraw(200, mockDeployed2.address)).to.be.revertedWith("You do not have enough tokens staked")
        })
        it("Withdraw should adjust all necessary balances", async()=>{
            await mockDeployed.approve(wrappedTokenHashDeployed.address, 20000);
            await wrappedTokenHashDeployed.deposit(200, mockDeployed.address);
            expect(await mockDeployed.balanceOf(wrappedTokenHashDeployed.address)).to.equal(200);
            expect(await mockDeployed.balanceOf(owner.address)).to.equal(500-200);
            expect(await wrappedTokenHashDeployed.balanceOf(owner.address, wrappedTokenHashDeployed.tokenHash(mockDeployed.address))).to.equal(200)
            await wrappedTokenHashDeployed.withdraw(200, mockDeployed.address);
            expect(await mockDeployed.balanceOf(wrappedTokenHashDeployed.address)).to.equal(0);
            expect(await mockDeployed.balanceOf(owner.address)).to.equal(500);
            expect(await wrappedTokenHashDeployed.balanceOfToken(owner.address, mockDeployed.address)).to.equal(0)
        })
        it("Should set correct balanceOfToken", async() =>{
            await mockDeployed.approve(wrappedTokenHashDeployed.address, 20000);
            await wrappedTokenHashDeployed.deposit(200, mockDeployed.address);  
            expect(await wrappedTokenHashDeployed.balanceOfToken(owner.address, mockDeployed.address)).to.equal(200);
        })
    })
})