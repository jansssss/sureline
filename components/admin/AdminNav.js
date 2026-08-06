'use client';
/**
 * 관리자 페이지 공통 메뉴
 * 관리자 화면 상단 바 안에 들어간다.
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ADMIN_MENU = [
  { href: '/admin/guides', label: '가이드 관리' },
  { href: '/admin/product-research', label: '직장인 관심제품 분석' },
];

export default function AdminNav() {
  const pathname = usePathname() || '';

  return (
    <nav aria-label="관리자 메뉴" style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
      {ADMIN_MENU.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            style={{
              fontSize: 12.5, fontWeight: active ? 800 : 600,
              color: active ? '#3268ff' : '#5a6a85',
              background: active ? 'rgba(50,104,255,0.09)' : 'transparent',
              padding: '5px 11px', borderRadius: 8, textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
