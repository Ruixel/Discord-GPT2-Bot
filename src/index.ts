import {
	Channel,
	Client,
	DMChannel,
	MessageManager,
	NewsChannel,
	TextChannel,
} from 'discord.js';
import Bot from './bot';
import { getContext, convertOutputToJSon, delay, isTextChannel } from './utils';

import axios from 'axios';
import { BotMessage, MessageData } from './datatypes';
import { getAllUserBots, masterBotToken } from './bot_tokens';
import { loadScraperCommands } from './scraperbot';

const client = new Client();
loadScraperCommands(client);

client.on('ready', () => {
	console.log('Hello im the master');
});

const bots = getAllUserBots();

export async function respond(channel: TextChannel, bot_msgs: BotMessage[]) {
	console.log('hey dude');
	const should_others_talk = Math.random() * 100 > 50;
	let name_of_respondent = '';

	// thinking wait 🤔
	await delay(Math.floor(Math.random() * 1000) + 1000);

	for (const msg of bot_msgs) {
		if (msg.username == '') continue;
		if (name_of_respondent == '') name_of_respondent = msg.username;
		if (!should_others_talk && msg.username != name_of_respondent) break;

		const user_bot = bots.get(msg.username);
		if (user_bot) {
			await delay(Math.floor(Math.random() * 2000) + 500);
			user_bot.say(channel, msg.content.substr(2));
		} else {
			const other_bot = bots.get('Other');
			await delay(Math.floor(Math.random() * 2000) + 500);
			if (other_bot) {
				other_bot.say(channel, `**${msg.username}**\n${msg.content.substr(2)}`);
			}
		}
	}
}

client.on('message', (msg) => {
	if (msg.author.id === '150049709698973696') {
		//if (msg.channel.id === '825416382560600124') { // Beware of Jack
		if (msg.content == '!get') {
			axios
				.get('http://192.168.0.67:5000/gen')
				.then((res) => {
					msg.reply(res.data);
				})
				.catch(console.error);
		}
		if (msg.content.startsWith('!post')) {
			const prompt = msg.content.substr(6) + ' <|EOL|>';
			console.log(prompt);
			axios
				.post('http://192.168.0.67:5000/generate', {
					text: prompt,
					length: 100,
				})
				.then((res) => {
					let data = JSON.stringify(res.data).substr(2);
					data = data.substr(0, data.length - 2);

					msg.reply(JSON.stringify(convertOutputToJSon(data, prompt)));
				})
				.catch(console.error);
		}
		if (msg.content.startsWith('!convert')) {
			if (!isTextChannel(msg.channel)) return;

			getContext(msg.channel, 3)
				.then((prompt) => {
					msg.channel.send(prompt);
				})
				.catch(console.error);
		}
		if (msg.content.startsWith('!ask')) {
		}
		if (msg.content.startsWith('!discuss')) {
			const args = msg.content.split(' ');
			const channelName = args[1];

			if (channelName === undefined) {
				msg.delete();
				return;
			}

			const channel = msg.guild?.channels.cache.find(
				(channel) => channel.name == channelName
			);
			if (channel && isTextChannel(channel)) {
				getContext(channel, 3)
					.then((prompt) => {
						axios
							.post('http://192.168.0.67:5000/generate', {
								text: prompt,
								length: 120,
							})
							.then((res) => {
								let data = JSON.stringify(res.data).substr(2);
								data = data.substr(0, data.length - 2);

								const obj = convertOutputToJSon(data, prompt);

								if (isTextChannel(channel)) {
									//msg.reply(JSON.stringify(obj));
									obj[0].username = obj[0].username.substr(1);
									respond(channel, obj);
								}
							})
							.catch(console.error);
					})
					.catch(console.error);
			}
		}
	}
});

client
	.login(masterBotToken)
	.then(() => console.log('Logged in'))
	.catch((err) => console.error('Error logging in'));
