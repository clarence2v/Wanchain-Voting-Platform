import { http, createConfig } from 'wagmi';
import { defineChain } from 'viem';
import {
  getDefaultConfig,
  connectorsForWallets
} from '@rainbow-me/rainbowkit';
import {
  okxWallet,
  rabbyWallet,
  metaMaskWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { mainnet, wanchainTestnet, wanchain } from 'wagmi/chains';
import type { Chain } from 'wagmi/chains'


const network: Chain =
  process.env.REACT_APP_CHAINID === '888' ? wanchain : wanchainTestnet

// 1. 自定义 Wanchain 链
export const wanchainMainnet = defineChain({
  id: 888,
  name: 'Wanchain',
  network: 'wanchain',
  nativeCurrency: {
    name: 'WAN',
    symbol: 'WAN',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://gwan-ssl.wandevs.org:56891'],
    },
    public: {
      http: ['https://gwan-ssl.wandevs.org:56891'],
    },
  },
  blockExplorers: {
    default: {
      name: 'WanScan',
      url: 'https://wanscan.org',
    },
  },
});

// 2. 要支持的链列表
export const chains = [wanchainMainnet, mainnet] as const;

// 3. WalletConnect 的 projectId
const projectId = 'e3b2cc9688caa268ca76081f5fb2e154';

// 4. 用 RainbowKit 提供的 getDefaultConfig（最省事）
export const config = getDefaultConfig({
  appName: 'Wanchain Voting Platform',
  projectId,
  chains,
  transports: {
    [wanchainMainnet.id]: http(wanchainMainnet.rpcUrls.default.http[0]),
    [mainnet.id]: http(),           // 这里可以换成你自己的以太坊 RPC
  },
  ssr: true,
});



const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [metaMaskWallet, rabbyWallet, okxWallet, walletConnectWallet],
    },
  ],
  {
    appName: 'VOTES',
    projectId,
  },
)

export const walletConfig = createConfig({
  chains: [network],
  transports: {
    [network.id]: http(),
  },
  connectors,
})
