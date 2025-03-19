export interface Message {
    id: string
    content: string
    createdAt: Date
    updatedAt: Date
    userId: string
    user: {
      name: string | null
      email: string
    }
  }
  
  