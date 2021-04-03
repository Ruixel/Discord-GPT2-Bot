import { TSMap } from 'typescript-map';

export interface MessageData {
	id: string;
	content: string;
	author: string;
	timestamp: Date;
}

interface BotMessage {
	username: string;
	content: string;
}

export type MessageChannelData = Array<MessageData>;
export type ServerMessageData = TSMap<string, MessageChannelData>;
