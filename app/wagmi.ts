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

export const chains = [wanchainMainnet, mainnet] as const;

const projectId = 'e3b2cc9688caa268ca76081f5fb2e154';

export const config = getDefaultConfig({
  appName: 'Wanchain Voting Platform',
  projectId,
  chains,
  transports: {
    [wanchainMainnet.id]: http(wanchainMainnet.rpcUrls.default.http[0]),
    [mainnet.id]: http(),
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
