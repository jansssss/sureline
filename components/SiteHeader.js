"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const HEALTH_TIPS = [
  { href: "/guides/myth",     label: "오해 바로잡기",  desc: "직장인 건강 상식 점검",   dot: "#dc2626" },
  { href: "/guides/hospital", label: "병원 가는 기준",  desc: "신호등 3단계 가이드",     dot: "#d97706" },
  { href: "/guides/routine",  label: "데일리 루틴",    desc: "출근·점심·퇴근 10분",     dot: "#9333ea" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
    setDropOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(50,104,255,0.10)",
        boxShadow: "0 2px 24px rgba(28,39,65,0.07)",
      }}>
        <div className="mx-auto max-w-5xl px-4" style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* 로고 */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <span style={{
              fontSize: 18, fontWeight: 900, letterSpacing: "-0.04em",
              background: "linear-gradient(135deg, #3268ff 0%, #7c3aed 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              sureline
            </span>
            <span style={{
              display: "none", fontSize: 12, color: "#9aa5b8", fontWeight: 500,
              borderLeft: "1px solid #e1e5eb", paddingLeft: 10,
            }}
              className="sm-inline"
            >
              직장인 건강 가이드
            </span>
          </Link>

          {/* 데스크톱 네비 */}
          <nav style={{ display: "flex", alignItems: "center", gap: 2 }} className="desktop-nav">

            <NavLink href="/topics" active={isActive("/topics")}>주제별</NavLink>
            <NavLink href="/guides" active={pathname === "/guides" || (pathname.startsWith("/guides/") && !isHealthTip(pathname))}>전체 글</NavLink>

            {/* 건강 상식 드롭다운 */}
            <div ref={dropRef} style={{ position: "relative" }}>
              <button
                onClick={() => setDropOpen((v) => !v)}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  fontSize: 14, fontWeight: 600,
                  color: isHealthTip(pathname) ? "#3268ff" : "#5a6a85",
                  background: isHealthTip(pathname) ? "rgba(50,104,255,0.08)" : "transparent",
                  border: "none", cursor: "pointer",
                  padding: "6px 12px", borderRadius: 8,
                  transition: "all 0.15s",
                }}
              >
                건강 상식
                <motion.svg
                  animate={{ rotate: dropOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  width="12" height="12" viewBox="0 0 12 12" fill="none"
                  style={{ opacity: 0.6 }}
                >
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              </button>

              <AnimatePresence>
                {dropOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    style={{
                      position: "absolute", top: "calc(100% + 8px)", right: 0,
                      minWidth: 200,
                      background: "rgba(255,255,255,0.90)",
                      backdropFilter: "blur(24px)",
                      WebkitBackdropFilter: "blur(24px)",
                      border: "1px solid rgba(50,104,255,0.14)",
                      borderRadius: 16,
                      boxShadow: "0 8px 32px rgba(28,39,65,0.12)",
                      padding: "8px",
                      overflow: "hidden",
                    }}
                  >
                    {HEALTH_TIPS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "10px 12px", borderRadius: 10,
                          textDecoration: "none",
                          background: pathname === item.href ? "rgba(50,104,255,0.07)" : "transparent",
                          transition: "background 0.12s",
                        }}
                        onMouseEnter={(e) => { if (pathname !== item.href) e.currentTarget.style.background = "rgba(50,104,255,0.05)"; }}
                        onMouseLeave={(e) => { if (pathname !== item.href) e.currentTarget.style.background = "transparent"; }}
                      >
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.dot, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#1c2741", lineHeight: 1.3 }}>{item.label}</div>
                          <div style={{ fontSize: 11, color: "#9aa5b8", marginTop: 1 }}>{item.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink href="/about" active={isActive("/about")}>소개</NavLink>
          </nav>

          {/* 모바일 햄버거 */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="mobile-menu-btn"
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              padding: 6, borderRadius: 8,
              display: "flex", flexDirection: "column", gap: 5,
            }}
            aria-label="메뉴"
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={
                  mobileOpen
                    ? i === 0 ? { rotate: 45, y: 7 }
                    : i === 1 ? { opacity: 0 }
                    : { rotate: -45, y: -7 }
                    : { rotate: 0, y: 0, opacity: 1 }
                }
                transition={{ duration: 0.2 }}
                style={{
                  display: "block", width: 22, height: 2,
                  background: "#1c2741", borderRadius: 2, transformOrigin: "center",
                }}
              />
            ))}
          </button>

        </div>
      </header>

      {/* 모바일 메뉴 */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{
              overflow: "hidden",
              position: "sticky", top: 56, zIndex: 49,
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(50,104,255,0.10)",
            }}
          >
            <nav style={{ padding: "12px 20px 20px", display: "flex", flexDirection: "column", gap: 2 }}>
              <MobileNavLink href="/topics" active={isActive("/topics")}>주제별</MobileNavLink>
              <MobileNavLink href="/guides" active={pathname === "/guides"}>전체 글</MobileNavLink>
              <div style={{ padding: "8px 0 4px", fontSize: 11, fontWeight: 700, color: "#c4cdd9", letterSpacing: "0.08em" }}>건강 상식</div>
              {HEALTH_TIPS.map((item) => (
                <MobileNavLink key={item.href} href={item.href} active={pathname === item.href}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: item.dot, display: "inline-block", marginRight: 8, flexShrink: 0 }} />
                  {item.label}
                </MobileNavLink>
              ))}
              <MobileNavLink href="/about" active={isActive("/about")}>소개</MobileNavLink>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .desktop-nav { display: none; }
        .mobile-menu-btn { display: flex; }
        .sm-inline { display: none; }
        @media (min-width: 640px) { .sm-inline { display: inline; } }
        @media (min-width: 768px) {
          .desktop-nav { display: flex; }
          .mobile-menu-btn { display: none; }
        }
      `}</style>
    </>
  );
}

function NavLink({ href, active, children }) {
  return (
    <Link
      href={href}
      style={{
        fontSize: 14, fontWeight: 600,
        color: active ? "#3268ff" : "#5a6a85",
        background: active ? "rgba(50,104,255,0.08)" : "transparent",
        padding: "6px 12px", borderRadius: 8,
        textDecoration: "none",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(50,104,255,0.05)"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, active, children }) {
  return (
    <Link
      href={href}
      style={{
        display: "flex", alignItems: "center",
        fontSize: 15, fontWeight: active ? 700 : 500,
        color: active ? "#3268ff" : "#3a4a62",
        background: active ? "rgba(50,104,255,0.08)" : "transparent",
        padding: "11px 14px", borderRadius: 10,
        textDecoration: "none",
        transition: "background 0.12s",
      }}
    >
      {children}
    </Link>
  );
}

function isHealthTip(pathname) {
  return HEALTH_TIPS.some((t) => pathname === t.href);
}
