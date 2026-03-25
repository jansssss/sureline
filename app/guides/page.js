import { fetchAllGuides } from "@/lib/supabase-server";
import PostCard from "@/components/PostCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "전체 글 — sureline",
  description: "직장인 목·어깨·허리 통증, 눈 피로, 피로 회복 관련 모든 가이드 목록입니다.",
};

export default async function GuidesPage() {
  const guides = await fetchAllGuides(100);

  return (
    <main className="flex-1">
      <div className="border-b border-gray-100 bg-white py-8">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-xl font-bold text-gray-900">전체 글</h1>
          <p className="mt-1 text-sm text-gray-500">총 {guides.length}개의 가이드</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {guides.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
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
