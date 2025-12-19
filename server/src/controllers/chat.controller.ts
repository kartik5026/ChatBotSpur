import { Request, Response, NextFunction } from 'express';
import { Constants } from '@/config/constants';
import ApiError from '@/utils/ApiError';
import {
	getChatHistorySchema,
	postChatMessageSchema,
} from '@/validators/chat.validator';
import * as chatService from '@/services/chat.service';

export const postMessage = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const parsed = postChatMessageSchema.safeParse(req.body);
		if (!parsed.success) {
			return next(
				new ApiError(
					Constants.HTTP_STATUS.BAD_REQUEST,
					parsed.error.issues[0]?.message || 'Invalid request',
				),
			);
		}

		const { message, sessionId } = parsed.data;
		const result = await chatService.postChatMessage({ message, sessionId });
		return res.status(Constants.HTTP_STATUS.OK).json(result);
	} catch (err) {
		return next(err);
	}
};

export const getHistory = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const parsed = getChatHistorySchema.safeParse(req.query);
		if (!parsed.success) {
			return next(
				new ApiError(
					Constants.HTTP_STATUS.BAD_REQUEST,
					parsed.error.issues[0]?.message || 'Invalid request',
				),
			);
		}

		const { sessionId } = parsed.data;
		const result = await chatService.getChatHistory({ sessionId });
		return res.status(Constants.HTTP_STATUS.OK).json(result);
	} catch (err) {
		return next(err);
	}
};

