pragma solidity >= 0.8.0;

import "./utils/ERC1155.sol";
import "./utils/SafeERC20.sol";


contract wrappedToken is ERC1155 {
    using SafeERC20 for IERC20;
    uint256 public counter = 0;
    mapping(address => mapping(IERC20 => uint256)) public balanceForToken;
    mapping(IERC20 => uint256) public counterForToken;

    uint256 public constant standard = 0;
    constructor() ERC1155("paladinsec.co"){
    }

    function deposit(uint256 _amount, IERC20 _token) external {
        if(counterForToken[_token] == 0){
            //set counterForToken
            counter++;
            counterForToken[_token] = counter;
        }

        balanceForToken[msg.sender][_token] += _amount;
        super._mint(msg.sender, counterForToken[_token], _amount, "");
        _token.safeTransferFrom(msg.sender, address(this), _amount);
    }

    

    function withdraw(uint256 _amount, IERC20 _token) external {
        require(balanceForToken[msg.sender][_token] >= _amount, "You do not have enough tokens staked");
        balanceForToken[msg.sender][_token] -= _amount;
        super._burn(msg.sender, counterForToken[_token], _amount);
        _token.safeTransfer(msg.sender, _amount);

    }
}