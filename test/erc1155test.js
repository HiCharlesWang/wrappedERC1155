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
            expect(await erc1155Deployed.balanceOf(owner.address, 0)).to.equal(200);
        })
    })
    describe("Withdraw function", () =>{
        it("Should transfer the token to the owner and decrease the amount", async() =>{
            await mockDeployed.approve(erc1155Deployed.address, 200);
            await erc1155Deployed.deposit(200, mockDeployed.address);
            await erc1155Deployed.withdraw(200, mockDeployed.address);
            expect(await erc1155Deployed.balanceOf(owner.address, 0)).to.equal(0);
            expect(await mockDeployed.balanceOf(owner.address)).to.equal(500);
            expect(await mockDeployed.balanceOf(erc1155Deployed.address)).to.equal(0);
        }) 
        })
        it("Deploy another mock and try to withdraw with the first mock", async() =>{
            mockFactory2 = await ethers.getContractFactory('ERC20Mock');
            mockDeployed2 = await mockFactory.deploy(owner.address);
            await mockDeployed2.mint(owner.address, 500)
            await mockDeployed2.approve(erc1155Deployed.address, 200);
            await erc1155Deployed.deposit(200, mockDeployed2.address);
            await expect(erc1155Deployed.withdraw(200, mockDeployed.address)).to.be.revertedWith("You do not have enough tokens staked")
        })
})