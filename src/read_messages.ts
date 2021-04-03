import {
	Channel,
	ChannelLogsQueryOptions,
	Collection,
	Message,
	TextChannel,
} from 'discord.js';
import { MessageChannelData } from './datatypes';
import { isTextChannel } from './utils';

const maxlimit = 100;

export async function readMessages(
	channel: TextChannel,
	channeldata: MessageChannelData,
	chunkNumber: number
) {
	// Get latest message gathered from this place
	let options: ChannelLogsQueryOptions = { limit: maxlimit };
	if (channeldata.length > 0) {
		options = { ...options, before: channeldata[channeldata.length - 1].id };
	}

	return channel.messages
		.fetch(options)
		.then(async (messages) => {
			await getMessageChunk(messages, chunkNumber, channeldata, true);
		})
		.catch((err) => console.error(`[Error] ${err}`));
}

export async function getMessageChunk(
	messages: Collection<string, Message>,
	chunksLeft: number,
	channeldata: MessageChannelData,
	log?: boolean
) {
	console.log(`Received ${messages.size} messages`);

	const earliest_msg = messages.last();

	// TODO: Write all messages to JSON
	const enddate = new Date(2021, 3, 8);
	for (const msg of messages.array()) {
		if (msg.createdAt > enddate) {
			channeldata.push({
				id: msg.id,
				author: msg.author.username, // Unsure of this (id?)
				content: msg.content,
				timestamp: msg.createdAt,
			});
		}
	}

	if (earliest_msg !== undefined) {
		if (log && isTextChannel(earliest_msg.channel)) {
			console.log(
				`Extracted chunk in ${earliest_msg.channel.name} Earliest message "${
					earliest_msg.content
				}" from ${earliest_msg.createdAt.toISOString()}`
			);
		}

		if (chunksLeft > 1) {
			const newMessages = await earliest_msg.channel.messages.fetch({
				limit: maxlimit,
				before: earliest_msg.id,
			});

			chunksLeft = chunksLeft - 1;
			await getMessageChunk(newMessages, chunksLeft, channeldata, log);
		}
		return;
	}

	throw new Error('Earliest message didnt work :/');
}
