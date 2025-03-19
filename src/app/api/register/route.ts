import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Only allow specific emails to register
    const allowedEmails = ["maludocinho@bombozinho.com", "joaodocinho@bombonzinho.com"]

    if (!allowedEmails.includes(email)) {
      return NextResponse.json({ error: "Registration is restricted to specific users" }, { status: 403 })
    }

    // Hash the password
    const hashedPassword = await hash(password, 10)

    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    // Return the user without the password
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error during registration:", error)
    return NextResponse.json({ error: "Something went wrong during registration" }, { status: 500 })
  }
}

