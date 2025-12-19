import { z } from 'zod';

export const postChatMessageSchema = z.object({
	message: z
		.string()
		.trim()
		.min(1, 'Message cannot be empty')
		.max(4000, 'Message is too long (max 4000 characters)'),
	sessionId: z.string().uuid().optional(),
});

export type PostChatMessageBody = z.infer<typeof postChatMessageSchema>;

export const getChatHistorySchema = z.object({
	sessionId: z.string().uuid(),
});

export type GetChatHistoryQuery = z.infer<typeof getChatHistorySchema>;

