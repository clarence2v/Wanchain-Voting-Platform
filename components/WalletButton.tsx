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

  // ✅ 只在 account 变化时重新生成渐变
  const bgColor = useMemo(() => {
    // 你也可以用 account?.address 做 seed，保证同一个地址渐变稳定
    // if (!account) return randomCssGradient();
    // return randomCssGradient();
    if (!account?.address) return randomCssGradient2();
    return randomCssGradient2(account?.address);
  }, [account?.address]); // 建议依赖地址，而不是整个 account 对象

  // 不要在未 ready 时渲染可交互内容
  if (!ready) {
    return (
      <div
        aria-hidden="true"
        style={{ opacity: 0, pointerEvents: 'none', userSelect: 'none' }}
      />
    );
  }

  // 未连接：显示「连接钱包」按钮
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

  // 链接有问题（错误网络）
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

  // 已连接时：左边显示余额，右边显示账户
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
