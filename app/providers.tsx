'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { ThemeProvider, useTheme } from 'next-themes';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { HeroUIProvider } from '@heroui/react';
import { walletConfig } from './wagmi';
import { Governance } from '@wandevs/governance-contracts-sdk';
import { wanchainTestnet } from 'viem/chains';
import { WAN_GOVERNOR_PROXY } from '@/config/address';

type SDKInstance = Governance | null;
const SdkContext = React.createContext<SDKInstance>(null);

function SdkProvider({ children }: { children: React.ReactNode }) {
  const sdk = React.useMemo(() => {
    return new Governance(WAN_GOVERNOR_PROXY, wanchainTestnet);
  }, []);

  return <SdkContext.Provider value={sdk}>{children}</SdkContext.Provider>;
}

export function useSdk() {
  const sdk = React.useContext(SdkContext);
  if (!sdk) {
    console.warn('sdk not initialized');
  }
  return sdk;
}

const queryClient = new QueryClient();

function ThemedRainbowKitProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <RainbowKitProvider
      showRecentTransactions
      modalSize="compact"
      theme={theme === 'dark' ? darkTheme() : lightTheme()}
    >
      {children}
    </RainbowKitProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
    >
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
