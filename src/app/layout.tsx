import LoginForm from "@/components/login-form"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-[url('/hello-kitty-background.jpg')] bg-repeat before:content-[''] before:absolute before:inset-0 before:bg-pink-50/80 relative">
      <div className="w-full max-w-md px-4 sm:px-0 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-pink-600 mb-2">Cute Kitty Chat</h1>
          <p className="text-gray-600">A special place for us two ❤️</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}

