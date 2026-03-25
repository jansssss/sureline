import Link from "next/link";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.slice(0, 10).split("-");
  return `${year}. ${parseInt(month)}. ${parseInt(day)}.`;
}

export default function PostCard({ guide }) {
  return (
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-md">
      <Link href={`/guides/${guide.slug}`} className="block p-5">
        {/* 카테고리 + 날짜 */}
        <div className="flex items-center gap-2 mb-3">
          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
            {guide.category}
          </span>
          <span className="text-xs text-gray-400">{formatDate(guide.updatedAt)}</span>
        </div>

        {/* 제목 */}
        <h2 className="text-base font-bold text-gray-900 leading-snug line-clamp-2 hover:text-teal-700 transition-colors mb-2">
          {guide.title}
        </h2>

        {/* 설명 */}
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{guide.description}</p>

        {/* 읽기 시간 */}
        <p className="mt-3 text-xs text-gray-400">{guide.readTime} 읽기</p>
      </Link>
    </article>
  );
}
