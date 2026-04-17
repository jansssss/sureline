import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">sureline</span>
          <span className="hidden sm:inline text-sm text-gray-500">직장인 건강 가이드</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm text-gray-600">
          <Link href="/topics" className="hover:text-gray-900 transition-colors">주제별</Link>
          <Link href="/guides" className="hover:text-gray-900 transition-colors">전체 글</Link>
          <Link href="/about" className="hover:text-gray-900 transition-colors">소개</Link>
        </nav>
      </div>
    </header>
  );
}
