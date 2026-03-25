import Link from "next/link";

export default function Footer() {
  return (
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
      </div>
    </footer>
  );
}
