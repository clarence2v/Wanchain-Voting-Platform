import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import './WalletButton.css';
import { randomCssGradient, randomCssGradient2 } from '@/utils/utils';
import { useMemo } from 'react';

export default function WalletButton() {
  const { theme } = useTheme();

  return (
    <ConnectButton.Custom>
      {(props) => (
        <WalletButtonInner
          {...props}
          theme={theme}
        />
      )}
    </ConnectButton.Custom>
  );
}

type InnerProps = Parameters<NonNullable<React.ComponentProps<typeof ConnectButton.Custom>['children']>>[0] & {
  theme: string | undefined;
};

function WalletButtonInner({
  account,
  chain,
  openAccountModal,
  openChainModal,
  openConnectModal,
  authenticationStatus,
  mounted,
  theme,
}: InnerProps) {
  const ready = mounted && authenticationStatus !== 'loading';
  const connected =
    ready &&
    account &&
    chain &&
    (!authenticationStatus || authenticationStatus === 'authenticated');

  const bgColor = useMemo(() => {
    if (!account?.address) return randomCssGradient2('');
    return randomCssGradient2(account?.address);
  }, [account?.address]);

  if (!ready) {
    return (
      <div
        aria-hidden="true"
        style={{ opacity: 0, pointerEvents: 'none', userSelect: 'none' }}
      />
    );
  }

  if (!connected) {
    return (
      <button
        onClick={openConnectModal}
        type="button"
        className="con not-connected cursor-pointer px-3 py-2 rounded-lg text-sm font-medium transition"
      >
        <Image
          src={theme === 'dark' ? '/wallet_dark_icon.svg' : '/wallet_light_icon.svg'}
          width={24}
          height={24}
          className="mr-2"
          alt="wallet icon"
        />
        Connect Wallet
      </button>
    );
  }

  if (chain?.unsupported) {
    return (
      <button
        onClick={openChainModal}
        type="button"
        className="cursor-pointer px-3 py-2 rounded-lg bg-red-600 text-sm font-medium hover:bg-red-500 transition"
      >
        切换网络
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      {account.displayBalance ? (
        <div className="con balance-con">
          <Image
            src="/wan_logo.svg"
            alt="logo"
            className="w-5 h-5 mr-2"
            width={20}
            height={20}
          />
          {account.displayBalance}
        </div>
      ) : null}

      <div onClick={openAccountModal} className="con account-con">
        <div
          style={{
            backgroundImage: bgColor,
          }}
          className="account-icon mr-2"
        />
        {account.displayName}
      </div>
    </div>
  );
}
