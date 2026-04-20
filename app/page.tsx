export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="text-center space-y-6">
        
        <h1 className="text-4xl font-bold">
          🚗 Bilservice
        </h1>

        <p className="text-lg text-gray-400">
          Vi är tillfälligt stängda
        </p>

        <p className="text-sm text-gray-500">
         WORKING 🚀
        </p>

        <a
          href="/login"
          className="inline-block mt-4 px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200"
        >
          Logga in
        </a>

      </div>
    </main>
  )
}