import Link from "next/link";
import { fetchAllGuides } from "@/lib/supabase-server";
import PostCard from "@/components/PostCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const guides = await fetchAllGuides(9);

  return (
    <main className="flex-1">
      {/* 히어로 */}
      <div className="border-b border-gray-100 bg-white py-10">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-2xl font-bold text-gray-900 leading-snug" style={{ wordBreak: "keep-all" }}>
            직장인 통증·피로, 원인부터 해결까지
          </h1>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed">
            목·어깨·허리 통증, 눈 피로, 만성 피로를 직접 해결하는 실용 가이드 모음입니다.
          </p>
        </div>
      </div>

      {/* 글 목록 */}
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-gray-700">최근 글</h2>
          <Link href="/guides" className="text-xs text-teal-600 hover:underline">
            전체 보기 →
          </Link>
        </div>

        {guides.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {guides.map((guide) => (
              <PostCard key={guide.slug} guide={guide} />
            ))}
          </div>
        ) : (
          <p className="text-center py-12 text-sm text-gray-400">아직 작성된 글이 없습니다.</p>
        )}
      </div>
    </main>
  );
}
