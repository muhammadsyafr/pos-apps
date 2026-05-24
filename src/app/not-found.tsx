"use client"

export default function NotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas-cream dark:bg-canvas-night flex items-center justify-center antialiased">
        <div className="text-center px-4">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto bg-shade-30 dark:bg-white/10 dark:bg-canvas-night-elevated rounded-full flex items-center justify-center">
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

          <h1 className="text-6xl font-black text-slate-300 dark:text-ink dark:text-shade-40 mb-4 font-display">
            404
          </h1>
          <h2 className="text-xl font-bold text-ink dark:text-on-dark mb-2">
            Page not found
          </h2>
          <p className="text-sm text-shade-50 dark:text-shade-40 mb-8 max-w-md mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          <a
            href="/en"
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
            Back to Home
          </a>
        </div>
      </body>
    </html>
  )
}
