import { prisma } from '@/models/prisma.model';

export type Sender = 'user' | 'ai';

export async function findConversationById(id: string) {
	return prisma.conversation.findUnique({ where: { id } });
}

export async function createConversation() {
	return prisma.conversation.create({ data: {} });
}

export async function createMessage(args: {
	conversationId: string;
	sender: Sender;
	text: string;
}) {
	return prisma.message.create({
		data: {
			conversationId: args.conversationId,
			sender: args.sender,
			text: args.text,
		},
	});
}

export async function getRecentMessages(args: {
	conversationId: string;
	limit: number;
}) {
	return prisma.message.findMany({
		where: { conversationId: args.conversationId },
		orderBy: { createdAt: 'desc' },
		take: args.limit,
	});
}

export async function getAllMessages(conversationId: string) {
	return prisma.message.findMany({
		where: { conversationId },
		orderBy: { createdAt: 'asc' },
	});
}

