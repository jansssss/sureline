'use client';
import { useAdmin } from './AdminProvider';
import { useRouter } from 'next/navigation';

export default function AdminEditButton({ slug }) {
  const { isAdmin } = useAdmin();
  const router = useRouter();

  if (!isAdmin) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '80px', right: '20px', zIndex: 1000,
    }}>
      <button
        onClick={() => router.push(`/admin/guides/${slug}/edit`)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '10px 18px', fontSize: '14px', fontWeight: 700,
          background: '#3268ff', color: '#fff',
          border: 'none', borderRadius: '999px', cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(50,104,255,0.35)',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(50,104,255,0.45)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(50,104,255,0.35)'; }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        수정
      </button>
    </div>
  );
}
