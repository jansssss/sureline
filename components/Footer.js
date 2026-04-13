'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useAdmin } from './AdminProvider';

export default function Footer() {
  const { isAdmin, login, logout } = useAdmin();
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      setShowModal(false);
      setEmail('');
      setPassword('');
    } else {
      setError('이메일 또는 비밀번호가 틀렸습니다.');
    }
  }

  function handleClose() {
    setShowModal(false);
    setError('');
    setEmail('');
    setPassword('');
  }

  return (
    <>
      <footer className="border-t border-gray-200 bg-gray-50 mt-auto py-8">
        <div className="mx-auto max-w-3xl px-4">
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 mb-4">
            <Link href="/about" className="hover:text-gray-800 transition-colors">소개</Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-gray-800 transition-colors">개인정보처리방침</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-gray-800 transition-colors">이용약관</Link>
          </div>
          <p className="text-center text-xs text-gray-400">
            © 2026 sureline. 본 사이트의 건강 정보는 참고용이며 전문 의료 상담을 대체하지 않습니다.
          </p>
          <div className="text-center mt-4">
            {isAdmin ? (
              <button
                onClick={logout}
                style={{ fontSize: '10px', color: '#c8d0de', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}
              >
                관리자 로그아웃
              </button>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                style={{ fontSize: '10px', color: '#c8d0de', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}
              >
                관리자
              </button>
            )}
          </div>
        </div>
      </footer>

      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div style={{ background: '#fff', borderRadius: '16px', padding: '32px 28px', width: '100%', maxWidth: '360px', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 800, color: '#1c2741' }}>관리자 로그인</h2>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일"
                autoFocus
                required
                style={{ width: '100%', padding: '10px 14px', fontSize: '15px', border: '1.5px solid #dde6ff', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', marginBottom: '8px' }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
                required
                style={{ width: '100%', padding: '10px 14px', fontSize: '15px', border: '1.5px solid #dde6ff', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', marginBottom: '8px' }}
              />
              {error && <p style={{ fontSize: '13px', color: '#e53e3e', margin: '0 0 8px' }}>{error}</p>}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={handleClose}
                  style={{ flex: 1, padding: '10px 0', fontSize: '14px', fontWeight: 600, background: '#f4f7ff', color: '#5a6a85', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ flex: 2, padding: '10px 0', fontSize: '14px', fontWeight: 700, background: '#3268ff', color: '#fff', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? '확인 중…' : '로그인'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
