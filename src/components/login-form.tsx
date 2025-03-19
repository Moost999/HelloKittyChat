"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Adicione um timeout para evitar esperas infinitas
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("O login está demorando muito. Tente novamente.")), 10000)
    );

    try {
      // Race entre a autenticação e o timeout
      const result = await Promise.race([
        signIn("credentials", {
          email,
          password,
          redirect: false,
        }),
        timeoutPromise
      ]);

      // Properly type the result object
      if (result && 'error' in result && result.error) {
        setError(result.error);
      } else {
        router.push("/chat");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Problema de conexão. Verifique sua internet ou tente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Image
          src="/logo.png"
          alt="Hello Kitty Chat Logo"
          width={100}
          height={100}
          className="mx-auto"
        />
        <h1 className="text-2xl font-bold text-pink-500">Hello Kitty Chat</h1>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <Button
            type="submit"
            className="w-full mt-6 bg-pink-500 hover:bg-pink-600"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center text-sm text-gray-500">
        Made with ❤️ by Moost
      </CardFooter>
    </Card>
  );
}