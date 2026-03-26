'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { ThemeProvider } from 'next-themes';
import { RainbowKitProvider, darkTheme, lightTheme, AvatarComponent } from '@rainbow-me/rainbowkit';
import { walletConfig } from './wagmi';
import { useTheme } from 'next-themes';
import { HeroUIProvider } from "@heroui/react";
// import { CHAIN_LIST } from '@/sdk/config/config';
import { Governance } from '@wandevs/governance-contracts-sdk';
import { wanchainTestnet } from 'viem/chains';
import { WAN_GOVERNOR_PROXY } from '@/config/address';

type SDKInstance = Governance | null;

const SdkContext = React.createContext<SDKInstance>(null);

function SdkProvider({ children }: { children: React.ReactNode }) {
  const sdk = React.useMemo(() => {
    const newSdk = new Governance(WAN_GOVERNOR_PROXY, wanchainTestnet);
    return newSdk;
  }, [wanchainTestnet])
  return <SdkContext.Provider value={sdk}>{children}</SdkContext.Provider>
}

export function useSdk() {
  const sdk = React.useContext(SdkContext);
  if (!sdk) {
    console.warn('sdk uninstall');
  }
  return sdk;
}

const queryClient = new QueryClient();

function ThemedRainbowKitProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <RainbowKitProvider 
      showRecentTransactions={true}
      modalSize="compact"
      theme={theme === 'dark' ? darkTheme() : lightTheme()}
    >
      {children}
    </RainbowKitProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();

  return (
    <ThemeProvider attribute="class">
      <HeroUIProvider>
        <WagmiProvider config={walletConfig}>
          <QueryClientProvider client={queryClient}>
            <ThemedRainbowKitProvider>
              <SdkProvider>
                {children}
              </SdkProvider>
            </ThemedRainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </HeroUIProvider>
    </ThemeProvider>
  );
}

export async function getServerSnapshot() {
  return {};
}