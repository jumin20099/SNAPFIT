export default function Loading() {
  return (
    <main className="mx-auto max-w-screen-lg p-4 animate-pulse">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="w-full aspect-square bg-gray-200 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-2/3" />
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="flex gap-3">
            <div className="h-9 bg-gray-200 rounded w-28" />
            <div className="h-9 bg-gray-200 rounded w-20" />
          </div>
          <ul className="space-y-2">
            <li className="h-4 bg-gray-200 rounded w-1/2" />
            <li className="h-4 bg-gray-200 rounded w-2/3" />
          </ul>
        </div>
      </section>
      <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-32" />
          <div className="h-24 bg-gray-200 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 rounded w-32" />
          <div className="h-24 bg-gray-200 rounded" />
        </div>
      </section>
    </main>
  )
}

