pragma solidity >= 0.8.0;

import "./utils/ERC1155.sol";
import "./utils/SafeERC20.sol";
import "./utils/enumerableSet.sol";
import "hardhat/console.sol";


contract wrappedTokenHash is ERC1155 {
    using SafeERC20 for IERC20;
    mapping(address => mapping(IERC20 => uint256)) public balanceForToken;
    mapping(IERC20 => bytes32) public tokenHash;
    constructor() ERC1155("paladinsec.co"){
    }

    function deposit(uint256 _amount, IERC20 _token) external {
        if(tokenHash[_token] == 0) {
            tokenHash[_token] = keccak256(abi.encode(_token));
        }
        balanceForToken[msg.sender][_token] += _amount;
        super._mint(msg.sender, uint256(bytes32(tokenHash[_token])), _amount, "");
        _token.safeTransferFrom(msg.sender, address(this), _amount);
    }

    

    function withdraw(uint256 _amount, IERC20 _token) external {
        require(tokenHash[_token] != 0, "This token was not registered yet");
        require(balanceForToken[msg.sender][_token] >= _amount, "You do not have enough tokens staked");
        balanceForToken[msg.sender][_token] -= _amount;
        super._burn(msg.sender, uint256(bytes32(tokenHash[_token])), _amount);
        _token.safeTransfer(msg.sender, _amount);

    }

    function balanceOfToken(address _addr, IERC20 _token) external view returns(uint256) {
        return super.balanceOf(_addr, uint256(bytes32(tokenHash[_token])));
    }
}