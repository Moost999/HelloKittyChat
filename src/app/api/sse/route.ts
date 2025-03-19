import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Force route to be dynamic
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Set headers for SSE
    const headers = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    };

    // Create a new ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        // Function to send messages
        const sendMessages = async () => {
          try {
            // Get messages from database
            const messages = await prisma.message.findMany({
              orderBy: {
                createdAt: 'asc',
              },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            });

            // Format the data as SSE
            const data = `data: ${JSON.stringify(messages)}\n\n`;
            controller.enqueue(new TextEncoder().encode(data));
          } catch (error) {
            console.error('Error fetching messages:', error);
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({ error: 'Failed to fetch messages' })}\n\n`
              )
            );
          }
        };

        // Send initial messages
        await sendMessages();

        // Set up interval to send messages every 3 seconds
        const interval = setInterval(sendMessages, 3000);

        // Clean up on close
        req.signal.addEventListener('abort', () => {
          clearInterval(interval);
        });
      },
    });

    return new NextResponse(stream, { headers });
  } catch (error) {
    console.error('SSE error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}