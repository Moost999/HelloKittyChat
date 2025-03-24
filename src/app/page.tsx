import LoginForm from "@/components/login-form"

export default function Home() {
  return (
    <main className="login-page relative flex min-h-screen flex-col items-center justify-center p-4">
      {/* Background image container with overlay */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/images/hello-kitty-background.jpg')] bg-repeat opacity-30" />
        <div className="absolute inset-0 bg-pink-50/70" /> {/* Semi-transparent overlay */}
      </div>

      <div className="relative z-10 w-full max-w-md px-4 sm:px-0">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-pink-600 mb-2">Cute Kitty Chat</h1>
          <p className="text-gray-600">A special place for us two ❤️</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}

