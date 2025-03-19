import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// Forçar a rota a ser dinâmica
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Obtendo a sessão do usuário autenticado usando a configuração importada
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Configurar headers para SSE
    const headers = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    };

    // Criar um novo ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        // Função para enviar mensagens
        const sendMessages = async () => {
          try {
            // Buscar mensagens no banco de dados
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

            // Formatar os dados no formato SSE
            const data = `data: ${JSON.stringify(messages)}\n\n`;
            controller.enqueue(new TextEncoder().encode(data));
          } catch (error) {
            console.error('Erro ao buscar mensagens:', error);
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({ error: 'Falha ao buscar mensagens' })}\n\n`
              )
            );
          }
        };

        // Enviar mensagens iniciais
        await sendMessages();

        // Configurar intervalo para enviar mensagens a cada 3 segundos
        const interval = setInterval(sendMessages, 3000);

        // Limpar ao fechar a conexão
        req.signal.addEventListener('abort', () => {
          clearInterval(interval);
          controller.close();
        });
      }
    });

    return new NextResponse(stream, { headers });
  } catch (error) {
    console.error('Erro SSE:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}