'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-6">🌿</div>
      <h1 className="font-display text-3xl text-forest-900 mb-3">You're offline</h1>
      <p className="text-forest-600 text-lg mb-8 max-w-xs">
        No internet connection right now. Your dashboard will be back as soon as you're connected again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-sage-500 text-white rounded-xl font-medium text-base active:scale-95 transition-transform"
      >
        Try again
      </button>
      <p className="mt-8 text-sm text-forest-400">
        Tip: previously visited pages may still be available.
      </p>
    </div>
  )
}
