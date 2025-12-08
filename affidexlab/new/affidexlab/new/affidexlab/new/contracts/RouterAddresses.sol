// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library RouterAddresses {
    address public constant UNISWAP_V3_ROUTER_ETHEREUM = 0xE592427A0AEce92De3Edee1F18E0157C05861564;
    address public constant UNISWAP_V3_ROUTER_ARBITRUM = 0xE592427A0AEce92De3Edee1F18E0157C05861564;
    address public constant UNISWAP_V3_ROUTER_OPTIMISM = 0xE592427A0AEce92De3Edee1F18E0157C05861564;
    address public constant UNISWAP_V3_ROUTER_POLYGON = 0xE592427A0AEce92De3Edee1F18E0157C05861564;
    address public constant UNISWAP_V3_ROUTER_BASE = 0x2626664c2603336E57B271c5C0b26F421741e481;
    address public constant UNISWAP_V3_ROUTER_AVALANCHE = 0xbb00FF08d01D300023C629E8fFfFcb65A5a578cE;

    address public constant AERODROME_ROUTER_BASE = 0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43;

    address public constant WETH_ETHEREUM = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address public constant WETH_ARBITRUM = 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1;
    address public constant WETH_OPTIMISM = 0x4200000000000000000000000000000000000006;
    address public constant WETH_POLYGON = 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619;
    address public constant WETH_BASE = 0x4200000000000000000000000000000000000006;
    address public constant WAVAX_AVALANCHE = 0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7;

    function getUniswapV3Router(uint256 chainId) internal pure returns (address) {
        if (chainId == 1) return UNISWAP_V3_ROUTER_ETHEREUM;
        if (chainId == 42161) return UNISWAP_V3_ROUTER_ARBITRUM;
        if (chainId == 10) return UNISWAP_V3_ROUTER_OPTIMISM;
        if (chainId == 137) return UNISWAP_V3_ROUTER_POLYGON;
        if (chainId == 8453) return UNISWAP_V3_ROUTER_BASE;
        if (chainId == 43114) return UNISWAP_V3_ROUTER_AVALANCHE;
        revert("Unsupported chain");
    }

    function getAerodromeRouter(uint256 chainId) internal pure returns (address) {
        if (chainId == 8453) return AERODROME_ROUTER_BASE;
        revert("Aerodrome not available on this chain");
    }

    function getWrappedNative(uint256 chainId) internal pure returns (address) {
        if (chainId == 1) return WETH_ETHEREUM;
        if (chainId == 42161) return WETH_ARBITRUM;
        if (chainId == 10) return WETH_OPTIMISM;
        if (chainId == 137) return WETH_POLYGON;
        if (chainId == 8453) return WETH_BASE;
        if (chainId == 43114) return WAVAX_AVALANCHE;
        revert("Unsupported chain");
    }
}
