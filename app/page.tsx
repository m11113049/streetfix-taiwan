import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 py-16">
      <section className="w-full rounded-3xl bg-white p-8 shadow-lg shadow-teal-100 sm:p-12">
        <span className="inline-block rounded-full bg-teal-100 px-4 py-1 text-sm font-semibold text-teal-800">
          StreetFix Taiwan
        </span>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-teal-900 sm:text-5xl">
          台灣街道通報平台
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-teal-800 sm:text-lg">
          透過簡單拍照與文字描述，快速通報道路與公共設施問題。StreetFix Taiwan
          幫助民眾與城市管理單位更有效協作，讓生活環境更安全、更便利。
        </p>
        <div className="mt-8">
          <Link
            href="/report"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-teal-700 px-8 py-3 text-base font-semibold text-white transition hover:bg-teal-800"
          >
            開始通報
          </Link>
        </div>
      </section>
    </main>
  );
}
