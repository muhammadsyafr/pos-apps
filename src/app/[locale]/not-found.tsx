import Link from "next/link"
import { useTranslations } from "next-intl"

export default function NotFound() {
  const t = useTranslations("common")

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center px-4">
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-shade-30 dark:bg-canvas-night-elevated rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-shade-50 dark:text-shade-40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-6xl font-black text-slate-200 dark:text-ink dark:text-shade-40 mb-4">
          404
        </h1>
        <h2 className="text-xl font-bold text-ink dark:text-on-dark mb-2">
          {t("notFound")}
        </h2>
        <p className="text-sm text-shade-50 dark:text-shade-40 mb-8 max-w-md mx-auto">
          {t("notFoundDescription")}
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-ink hover:bg-ink text-white rounded-xl font-bold text-sm transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          {t("backHome")}
        </Link>
      </div>
    </div>
  )
}
