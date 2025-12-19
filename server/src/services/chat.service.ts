import * as chatModel from '@/models/chat.model';
import { generateReply } from '@/services/llm.service';

const HISTORY_LIMIT = 16;

export async function postChatMessage(args: {
	message: string;
	sessionId?: string;
}): Promise<{ reply: string; sessionId: string }> {
	const conversation =
		args.sessionId != null
			? await chatModel.findConversationById(args.sessionId)
			: null;

	const ensuredConversation = conversation ?? (await chatModel.createConversation());

	await chatModel.createMessage({
		conversationId: ensuredConversation.id,
		sender: 'user',
		text: args.message,
	});

	const recent = await chatModel.getRecentMessages({
		conversationId: ensuredConversation.id,
		limit: HISTORY_LIMIT,
	});

	const history = recent
		.reverse()
		.map((m) => ({ sender: m.sender as 'user' | 'ai', text: m.text }));

	const reply = await generateReply({ history, userMessage: args.message });

	await chatModel.createMessage({
		conversationId: ensuredConversation.id,
		sender: 'ai',
		text: reply,
	});

	return { reply, sessionId: ensuredConversation.id };
}

export async function getChatHistory(args: {
	sessionId: string;
}): Promise<{
	sessionId: string;
	messages: Array<{ id: string; sender: string; text: string; createdAt: Date }>;
}> {
	const conversation = await chatModel.findConversationById(args.sessionId);

	if (!conversation) {
		return { sessionId: args.sessionId, messages: [] };
	}

	const messages = await chatModel.getAllMessages(args.sessionId);

	return {
		sessionId: args.sessionId,
		messages: messages.map((m) => ({
			id: m.id,
			sender: m.sender,
			text: m.text,
			createdAt: m.createdAt,
		})),
	};
}

