import path from "path";
process.env.LOCALAPPDATA = path.resolve(__dirname, ".localappdata");

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: false,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    gasPrice: 30, // gwei – illustrative for Indian bank infra cost estimates
    coinmarketcap: undefined, // set COINMARKETCAP_API_KEY env var for live USD conversion
    outputFile: undefined,
    noColors: false,
    reportFormat: "terminal",
    includeBytecodeInJSON: false,
    suppressTerminalOutput: false,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
