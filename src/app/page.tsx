import LoginForm from "@/components/login-form"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-pink-50">
      <div className="w-full max-w-md px-4 sm:px-0">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-pink-600 mb-2">Hello Kitty Chat</h1>
          <p className="text-gray-600">A special place for you two ❤️</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}

