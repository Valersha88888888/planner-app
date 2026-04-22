export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black px-6 text-white">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">
            🚗 Bilservice
          </h1>

          <p className="text-sm text-white/50">
            Панель управления автосервисом
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <p className="text-sm text-white/60">
            Система работает 🚀
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <a
            href="/login"
            className="block w-full rounded-xl bg-white px-6 py-4 text-center text-lg font-semibold text-black transition hover:opacity-90"
          >
            Войти
          </a>

          <a
            href="/signup"
            className="block w-full rounded-xl border border-white/20 px-6 py-4 text-center text-lg font-semibold text-white transition hover:bg-white/10"
          >
            Регистрация
          </a>
        </div>

        <p className="text-xs text-white/30">
          © Bilservice 2026
        </p>
      </div>
    </main>
  )
}