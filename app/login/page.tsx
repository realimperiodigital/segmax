import { loginAction } from "./actions"

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <h1 className="mb-6 text-2xl font-bold text-center">SegMax CRM</h1>

        <form action={loginAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-yellow-500 px-4 py-3 font-bold text-black"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  )
}