// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./AnchorRegistry.sol";

contract AnchorVault is Ownable {
    IERC20 public usdcToken;
    AnchorRegistry public registry;

    uint256 public totalLiquidity;
    mapping(address => uint256) public lpBalances;

    event Deposited(address indexed lp, uint256 amount);
    event Withdrawn(address indexed lp, uint256 amount);
    event LiquidityDrawn(address indexed anchor, uint256 amount);
    event LiquidityRepaid(address indexed anchor, uint256 amount);

    constructor(address _usdcToken, address _registry) Ownable(msg.sender) {
        usdcToken = IERC20(_usdcToken);
        registry = AnchorRegistry(_registry);
    }

    function deposit(uint256 amount) external {
        require(usdcToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        lpBalances[msg.sender] += amount;
        totalLiquidity += amount;
        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        require(lpBalances[msg.sender] >= amount, "Insufficient balance");
        require(totalLiquidity >= amount, "Pool depleted");
        lpBalances[msg.sender] -= amount;
        totalLiquidity -= amount;
        require(usdcToken.transfer(msg.sender, amount), "Transfer failed");
        emit Withdrawn(msg.sender, amount);
    }

    function drawLiquidity(uint256 amount) external {
        AnchorRegistry.AnchorRecord memory anchor = registry.getAnchor(msg.sender);
        require(anchor.isWhitelisted, "Not whitelisted");
        require(anchor.activeDraw + amount <= anchor.creditLimit, "Credit limit exceeded");
        require(totalLiquidity >= amount, "Insufficient pool liquidity");
        
        totalLiquidity -= amount;
        require(usdcToken.transfer(msg.sender, amount), "Transfer failed");
        emit LiquidityDrawn(msg.sender, amount);
    }

    function repayLiquidity(uint256 amount) external {
        require(usdcToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        totalLiquidity += amount;
        emit LiquidityRepaid(msg.sender, amount);
    }
}
