// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AnchorRegistry is Ownable {
    IERC20 public vaultToken;

    struct AnchorRecord {
        bool isWhitelisted;
        uint256 creditLimit;
        uint256 lockedCollateral;
        uint256 reputationScore;
        uint256 activeDraw;
        uint256 lastDrawTimestamp;
    }

    mapping(address => AnchorRecord) public anchors;

    event AnchorRegistered(address indexed anchor, uint256 creditLimit);
    event CollateralLocked(address indexed anchor, uint256 amount);
    event ReputationUpdated(address indexed anchor, uint256 newScore);

    constructor(address _vaultToken) Ownable(msg.sender) {
        vaultToken = IERC20(_vaultToken);
    }

    function registerAnchor(address anchor, uint256 creditLimit) external onlyOwner {
        anchors[anchor].isWhitelisted = true;
        anchors[anchor].creditLimit = creditLimit;
        anchors[anchor].reputationScore = 500; // default score
        emit AnchorRegistered(anchor, creditLimit);
    }

    function lockCollateral(uint256 amount) external {
        require(anchors[msg.sender].isWhitelisted, "Not whitelisted");
        require(vaultToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        anchors[msg.sender].lockedCollateral += amount;
        emit CollateralLocked(msg.sender, amount);
    }

    function getAnchor(address anchor) external view returns (AnchorRecord memory) {
        return anchors[anchor];
    }
}
