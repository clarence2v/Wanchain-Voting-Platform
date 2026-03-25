'use client';

import { Container, Navbar, Nav } from 'react-bootstrap';
import { useTheme } from 'next-themes';
import './Header.css';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import WalletButton from './WalletButton';

const Header = () => {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname === path ? 'header-button-active' : '';

  const toggleTheme = () => {
    const effectiveTheme = theme === 'system' ? systemTheme : theme;
    setTheme(effectiveTheme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ 不要整个 Header 消失，可以用一个“降级版”在未 mounted 时先画出来
  const currentTheme = mounted
    ? theme === 'system'
      ? systemTheme
      : theme
    : 'light'; // 初始先当作 light 渲染，避免闪屏

  return (
    <Navbar data-bs-theme={currentTheme || 'light'}>
      <Container className="header px-[120] py-4 flex items-center justify-between">
        <div className="flex h-8 items-center">
          <Image
            src="/wan_logo.svg"
            alt="logo"
            className="logo w-8 h-8"
            width={32}
            height={32}
          />
          <div className="ml-1">
            <p className="logo-name h-3.5 leading-3.5 mb-1">Wanchain</p>
            <p className="logo-title h-3 leading-3">GOVERNANCE</p>
          </div>

          {/* ✅ 用 next/link 做客户端导航，避免整页刷新 */}
          <Nav.Item className={`nav-con mx-3 ${isActive('/')}`}>
            <Nav.Link as={Link} href="/" className="header-button">
              Home
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className={`nav-con mx-3 ${isActive('/proposals')}`}>
            <Nav.Link as={Link} href="/proposals" className="header-button">
              My Proposals
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className={`nav-con mx-3 ${isActive('/votes')}`}>
            <Nav.Link as={Link} href="/votes" className="header-button">
              My Votes
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className={`nav-con mx-3 ${isActive('/docs')}`}>
            {/* 如果 docs 还没做，也可以先用 # 或外链 */}
            <Nav.Link as={Link} href="/docs" className="header-button">
              Docs
            </Nav.Link>
          </Nav.Item>
        </div>

        <div className="flex flex-row-reverse items-center">
          <div
            className="darkMode cursor-pointer ml-3"
            onClick={toggleTheme}
          >
            <Image
              src={
                currentTheme === 'dark'
                  ? '/dark_btn_icon.svg'
                  : '/light_btn_icon.svg'
              }
              alt="dark mode toggle"
              className="cursor-pointer"
              width={24}
              height={24}
            />
          </div>
          <div className="connect-wallet">
            <WalletButton />
          </div>

          <Nav.Item className={`nav-con mx-3 ${isActive('/createProposal')}`}>
            {/* 如果 docs 还没做，也可以先用 # 或外链 */}
            <Nav.Link as={Link} href="/createProposal" className="header-button">
              New
            </Nav.Link>
          </Nav.Item>
        </div>
      </Container>
    </Navbar>
  );
};

export default Header;
