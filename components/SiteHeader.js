"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { href: "/topics", label: "주제별" },
  { href: "/guides", label: "전체 글" },
];

const HEALTH_TIPS = [
  { href: "/guides/myth",      label: "오해 바로잡기",  desc: "직장인 건강 상식 점검",  dot: "#dc2626" },
  { href: "/guides/hospital",  label: "병원 가는 기준", desc: "신호등 3단계 가이드",    dot: "#d97706" },
  { href: "/guides/routine",   label: "데일리 루틴",   desc: "출근·점심·퇴근 10분",   dot: "#9333ea" },
];

const MORE_ITEMS = [
  { href: "/guides/job",       label: "직무별 가이드",  group: "상황별" },
  { href: "/guides/situation", label: "상황별 가이드",  group: "상황별" },
  { href: "/guides/season",    label: "계절별 가이드",  group: "상황별" },
  { href: "/guides/age",       label: "연령대별 가이드", group: "상황별" },
  { href: "/guides/glossary",  label: "용어 해설",      group: "자료" },
  { href: "/guides/start",     label: "어디서 시작할까", group: "자료" },
  { href: "/guides/downloads", label: "다운로드 자료",  group: "자료" },
  { href: "/guides/monthly",   label: "월간 정리",      group: "자료" },
  { href: "/guides/updates",   label: "업데이트 노트",  group: "자료" },
];

function isHealthTip(p) { return HEALTH_TIPS.some((t) => p === t.href); }
function isMoreItem(p) { return MORE_ITEMS.some((t) => p === t.href); }

const glass = {
  background: "rgba(255,255,255,0.75)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(50,104,255,0.12)",
};

export default function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        ...glass,
        borderTop: "none",
        borderLeft: "none",
        borderRight: "none",
        borderBottom: "1px solid rgba(50,104,255,0.10)",
        boxShadow: "0 2px 24px rgba(28,39,65,0.06)",
      }}>
        <div className="mx-auto max-w-5xl px-4" style={{ height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* 로고 */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: "#1c2741", letterSpacing: "-0.04em" }}>sureline</span>
            <span style={{ fontSize: 12, color: "#b0bcc8", fontWeight: 500 }} className="logo-sub">직장인 건강 가이드</span>
          </Link>

          {/* 데스크톱 Radix NavigationMenu */}
          <NavigationMenu.Root className="sureline-nav-root">
            <NavigationMenu.List className="sureline-nav-list">

              {NAV_ITEMS.map((item) => (
                <NavigationMenu.Item key={item.href}>
                  <NavigationMenu.Link asChild active={pathname === item.href || (item.href === "/guides" && pathname.startsWith("/guides/") && !isHealthTip(pathname) && !isMoreItem(pathname))}>
                    <Link href={item.href} className="sureline-nav-link">
                      {item.label}
                    </Link>
                  </NavigationMenu.Link>
                </NavigationMenu.Item>
              ))}

              {/* 건강 상식 드롭다운 */}
              <NavigationMenu.Item>
                <NavigationMenu.Trigger className={`sureline-nav-link sureline-nav-trigger${isHealthTip(pathname) ? " active" : ""}`}>
                  건강 상식
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ marginLeft: 3, opacity: 0.55 }}>
                    <path d="M1.5 3.5l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </NavigationMenu.Trigger>
                <NavigationMenu.Content className="sureline-nav-content">
                  <div style={{ padding: 8, minWidth: 210 }}>
                    {HEALTH_TIPS.map((item) => (
                      <Link key={item.href} href={item.href} className="sureline-drop-item">
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.dot, display: "block", flexShrink: 0, marginTop: 4 }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#1c2741" }}>{item.label}</div>
                          <div style={{ fontSize: 11, color: "#9aa5b8", marginTop: 1 }}>{item.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </NavigationMenu.Content>
              </NavigationMenu.Item>

              {/* 더 보기 드롭다운 */}
              <NavigationMenu.Item>
                <NavigationMenu.Trigger className={`sureline-nav-link sureline-nav-trigger${isMoreItem(pathname) ? " active" : ""}`}>
                  더 보기
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ marginLeft: 3, opacity: 0.55 }}>
                    <path d="M1.5 3.5l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </NavigationMenu.Trigger>
                <NavigationMenu.Content className="sureline-nav-content">
                  <div style={{ padding: 8, minWidth: 240 }}>
                    {["상황별", "자료"].map((group) => (
                      <div key={group}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#c4cdd9", letterSpacing: "0.08em", padding: "6px 12px 4px", textTransform: "uppercase" }}>{group}</div>
                        {MORE_ITEMS.filter((m) => m.group === group).map((item) => (
                          <Link key={item.href} href={item.href} className="sureline-drop-item" style={{ padding: "8px 12px" }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: pathname === item.href ? "#3268ff" : "#1c2741" }}>{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </NavigationMenu.Content>
              </NavigationMenu.Item>

              <NavigationMenu.Item>
                <NavigationMenu.Link asChild active={pathname === "/about"}>
                  <Link href="/about" className="sureline-nav-link">소개</Link>
                </NavigationMenu.Link>
              </NavigationMenu.Item>

            </NavigationMenu.List>
            <NavigationMenu.Viewport className="sureline-nav-viewport" />
          </NavigationMenu.Root>

          {/* 모바일 햄버거 */}
          <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
            <Dialog.Trigger asChild>
              <button className="sureline-hamburger" aria-label="메뉴 열기">
                <AnimatePresence mode="wait" initial={false}>
                  {mobileOpen ? (
                    <motion.svg key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }} width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M4 4l12 12M16 4L4 16" stroke="#1c2741" strokeWidth="2" strokeLinecap="round" />
                    </motion.svg>
                  ) : (
                    <motion.svg key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }} width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="2" y="5" width="16" height="1.8" rx="0.9" fill="#1c2741" />
                      <rect x="2" y="9.1" width="16" height="1.8" rx="0.9" fill="#1c2741" />
                      <rect x="2" y="13.2" width="16" height="1.8" rx="0.9" fill="#1c2741" />
                    </motion.svg>
                  )}
                </AnimatePresence>
              </button>
            </Dialog.Trigger>

            <AnimatePresence>
              {mobileOpen && (
                <Dialog.Portal forceMount>
                  <Dialog.Overlay asChild>
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ position: "fixed", inset: 0, background: "rgba(28,39,65,0.25)", zIndex: 48 }}
                    />
                  </Dialog.Overlay>
                  <Dialog.Content asChild>
                    <motion.div
                      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                      transition={{ type: "spring", stiffness: 320, damping: 34 }}
                      style={{
                        position: "fixed", top: 0, right: 0, bottom: 0, width: 280, zIndex: 49,
                        background: "rgba(255,255,255,0.97)",
                        backdropFilter: "blur(24px)",
                        WebkitBackdropFilter: "blur(24px)",
                        boxShadow: "-8px 0 40px rgba(28,39,65,0.12)",
                        display: "flex", flexDirection: "column",
                        padding: "0 0 24px",
                      }}
                    >
                      {/* 모바일 헤더 */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #eef2f7" }}>
                        <span style={{ fontSize: 16, fontWeight: 900, color: "#1c2741", letterSpacing: "-0.03em" }}>sureline</span>
                        <Dialog.Close asChild>
                          <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                              <path d="M3 3l12 12M15 3L3 15" stroke="#5a6a85" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                          </button>
                        </Dialog.Close>
                      </div>

                      {/* 메뉴 항목 */}
                      <nav style={{ flex: 1, overflowY: "auto", padding: "12px 12px" }}>
                        {NAV_ITEMS.map((item) => (
                          <MobileLink key={item.href} href={item.href} active={pathname === item.href} onClick={() => setMobileOpen(false)}>
                            {item.label}
                          </MobileLink>
                        ))}

                        <div style={{ fontSize: 10, fontWeight: 700, color: "#c4cdd9", letterSpacing: "0.1em", padding: "14px 12px 6px", textTransform: "uppercase" }}>건강 상식</div>
                        {HEALTH_TIPS.map((item) => (
                          <MobileLink key={item.href} href={item.href} active={pathname === item.href} onClick={() => setMobileOpen(false)}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: item.dot, display: "inline-block", marginRight: 8, flexShrink: 0 }} />
                            {item.label}
                          </MobileLink>
                        ))}

                        <div style={{ fontSize: 10, fontWeight: 700, color: "#c4cdd9", letterSpacing: "0.1em", padding: "14px 12px 6px", textTransform: "uppercase" }}>상황별</div>
                        {MORE_ITEMS.filter((m) => m.group === "상황별").map((item) => (
                          <MobileLink key={item.href} href={item.href} active={pathname === item.href} onClick={() => setMobileOpen(false)}>
                            {item.label}
                          </MobileLink>
                        ))}

                        <div style={{ fontSize: 10, fontWeight: 700, color: "#c4cdd9", letterSpacing: "0.1em", padding: "14px 12px 6px", textTransform: "uppercase" }}>자료</div>
                        {MORE_ITEMS.filter((m) => m.group === "자료").map((item) => (
                          <MobileLink key={item.href} href={item.href} active={pathname === item.href} onClick={() => setMobileOpen(false)}>
                            {item.label}
                          </MobileLink>
                        ))}

                        <div style={{ borderTop: "1px solid #eef2f7", marginTop: 12, paddingTop: 12 }}>
                          <MobileLink href="/about" active={pathname === "/about"} onClick={() => setMobileOpen(false)}>소개</MobileLink>
                        </div>
                      </nav>
                    </motion.div>
                  </Dialog.Content>
                </Dialog.Portal>
              )}
            </AnimatePresence>
          </Dialog.Root>

        </div>
      </header>

      <style>{`
        /* 로고 서브텍스트 */
        .logo-sub { display: none; }
        @media (min-width: 640px) { .logo-sub { display: inline; } }

        /* 데스크톱 nav 루트 */
        .sureline-nav-root { display: none; position: relative; }
        @media (min-width: 768px) { .sureline-nav-root { display: block; } }

        .sureline-nav-list {
          display: flex; align-items: center; gap: 2px;
          list-style: none; margin: 0; padding: 0;
        }

        .sureline-nav-link {
          display: inline-flex; align-items: center;
          font-size: 14px; font-weight: 600;
          color: #5a6a85;
          padding: 6px 13px; border-radius: 8px;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
          background: transparent; border: none; cursor: pointer;
          font-family: inherit;
        }
        .sureline-nav-link:hover { background: rgba(50,104,255,0.06); color: #1c2741; }
        .sureline-nav-link[data-active] { color: #3268ff; background: rgba(50,104,255,0.09); }
        .sureline-nav-link.active { color: #3268ff; background: rgba(50,104,255,0.09); }

        .sureline-nav-trigger { user-select: none; }
        .sureline-nav-trigger[data-state="open"] { color: #3268ff; background: rgba(50,104,255,0.09); }

        /* 드롭다운 컨텐츠 */
        .sureline-nav-content {
          position: absolute;
          background: rgba(255,255,255,0.94);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(50,104,255,0.13);
          border-radius: 16px;
          box-shadow: 0 8px 40px rgba(28,39,65,0.13);
          animation: navFadeIn 0.18s ease;
        }
        @keyframes navFadeIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Radix viewport */
        .sureline-nav-viewport {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: var(--radix-navigation-menu-viewport-width);
          height: var(--radix-navigation-menu-viewport-height);
          transition: width 0.25s ease, height 0.25s ease;
          overflow: hidden;
        }

        .sureline-drop-item {
          display: flex; align-items: flex-start; gap: 10;
          padding: 10px 12px; border-radius: 10px;
          text-decoration: none;
          transition: background 0.12s;
          cursor: pointer;
        }
        .sureline-drop-item:hover { background: rgba(50,104,255,0.06); }

        /* 햄버거 (모바일만) */
        .sureline-hamburger {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px;
          background: transparent; border: none; cursor: pointer;
          border-radius: 8px; transition: background 0.15s;
        }
        .sureline-hamburger:hover { background: rgba(50,104,255,0.07); }
        @media (min-width: 768px) { .sureline-hamburger { display: none; } }
      `}</style>
    </>
  );
}

function MobileLink({ href, active, onClick, children }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center",
        padding: "10px 12px", borderRadius: 10,
        fontSize: 14, fontWeight: active ? 700 : 500,
        color: active ? "#3268ff" : "#3a4a62",
        background: active ? "rgba(50,104,255,0.08)" : "transparent",
        textDecoration: "none", transition: "background 0.12s",
        wordBreak: "keep-all",
      }}
    >
      {children}
    </Link>
  );
}
