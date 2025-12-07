// Complete Contract ABIs for Bridge Integrations

export const CCTP_TOKEN_MESSENGER_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint32", name: "destinationDomain", type: "uint32" },
      { internalType: "bytes32", name: "mintRecipient", type: "bytes32" },
      { internalType: "address", name: "burnToken", type: "address" }
    ],
    name: "depositForBurn",
    outputs: [{ internalType: "uint64", name: "_nonce", type: "uint64" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint32", name: "destinationDomain", type: "uint32" },
      { internalType: "bytes32", name: "mintRecipient", type: "bytes32" },
      { internalType: "address", name: "burnToken", type: "address" },
      { internalType: "bytes32", name: "destinationCaller", type: "bytes32" }
    ],
    name: "depositForBurnWithCaller",
    outputs: [{ internalType: "uint64", name: "nonce", type: "uint64" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "localMessageTransmitter",
    outputs: [{ internalType: "contract IMessageTransmitter", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "remoteTokenMessengers",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

export const CCIP_ROUTER_ABI = [
  {
    inputs: [
      {
        internalType: "uint64",
        name: "destinationChainSelector",
        type: "uint64"
      },
      {
        components: [
          { internalType: "bytes", name: "receiver", type: "bytes" },
          { internalType: "bytes", name: "data", type: "bytes" },
          {
            components: [
              { internalType: "address", name: "token", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" }
            ],
            internalType: "struct Client.EVMTokenAmount[]",
            name: "tokenAmounts",
            type: "tuple[]"
          },
          { internalType: "address", name: "feeToken", type: "address" },
          { internalType: "bytes", name: "extraArgs", type: "bytes" }
        ],
        internalType: "struct Client.EVM2AnyMessage",
        name: "message",
        type: "tuple"
      }
    ],
    name: "ccipSend",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint64", name: "destinationChainSelector", type: "uint64" },
      {
        components: [
          { internalType: "bytes", name: "receiver", type: "bytes" },
          { internalType: "bytes", name: "data", type: "bytes" },
          {
            components: [
              { internalType: "address", name: "token", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" }
            ],
            internalType: "struct Client.EVMTokenAmount[]",
            name: "tokenAmounts",
            type: "tuple[]"
          },
          { internalType: "address", name: "feeToken", type: "address" },
          { internalType: "bytes", name: "extraArgs", type: "bytes" }
        ],
        internalType: "struct Client.EVM2AnyMessage",
        name: "message",
        type: "tuple"
      }
    ],
    name: "getFee",
    outputs: [{ internalType: "uint256", name: "fee", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint64", name: "chainSelector", type: "uint64" }],
    name: "isChainSupported",
    outputs: [{ internalType: "bool", name: "supported", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getSupportedTokens",
    outputs: [{ internalType: "address[]", name: "tokens", type: "address[]" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

// ERC20 Approve ABI (for token approvals before bridging)
export const ERC20_APPROVE_ABI = [
  {
    constant: false,
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" }
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  }
] as const;
