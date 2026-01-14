// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./IYieldStrategy.sol";

contract MockYieldStrategy is IYieldStrategy {
    using SafeERC20 for IERC20;

    IERC20 public immutable underlyingAsset;
    mapping(address => uint256) public balances;
    
    // Simulate yield by just tracking balances. 
    // In a real mock, we might mint extra tokens or have a way to inject "yield".
    
    constructor(address _asset) {
        underlyingAsset = IERC20(_asset);
    }

    function deposit(uint256 amount) external override returns (uint256 shares) {
        underlyingAsset.safeTransferFrom(msg.sender, address(this), amount);
        balances[msg.sender] += amount;
        return amount; // 1:1 for simplicity in mock
    }

    function withdraw(uint256 amount, address recipient) external override returns (uint256 sharesBurned) {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        underlyingAsset.safeTransfer(recipient, amount);
        return amount;
    }

    function asset() external view override returns (address) {
        return address(underlyingAsset);
    }

    function balanceOf(address account) external view override returns (uint256) {
        return balances[account];
    }
}
