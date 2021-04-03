import { Channel, DMChannel, NewsChannel, TextChannel } from 'discord.js';

interface BotMessage {
	username: string;
	content: string;
}

// Gets the last couple of messages and encodes them in a way the bot understands
export function getContext(
	channel: TextChannel,
	size: number
): Promise<string> {
	return channel.messages.fetch({ limit: 3 }).then((msgs) => {
		let prompt = '';
		msgs
			.array()
			.reverse()
			.map((msg) => {
				prompt +=
					msg.author.username +
					': ' +
					msg.content.split('\\n').join('\n') +
					' <|EOL|>\n';
			});
		return prompt;
	});
}

export function convertOutputToJSon(
	output_str: string,
	prompt: string
): BotMessage[] {
	const trimmed_str = output_str.substr(prompt.length + 2);
	const msgs = trimmed_str.split('<|EOL|>\\n');
	const bot_msgs: BotMessage[] = [];
	for (const msg of msgs) {
		const bot_msg: BotMessage = {
			username: msg.substr(0, msg.indexOf(':')),
			content: msg.substr(msg.indexOf(':')),
		};
		bot_msgs.push(bot_msg);
	}
	bot_msgs.pop();
	return bot_msgs;
}

export function tempMessage(
	message: string,
	channel: TextChannel | DMChannel | NewsChannel,
	length: number
) {
	const imsg = channel.send(message);
	imsg.then(async (imsg) => {
		await delay(length);
		imsg.delete();
	});
}

export function isTextChannel(channel: Channel): channel is TextChannel {
	return channel.type === 'text';
}

export function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
