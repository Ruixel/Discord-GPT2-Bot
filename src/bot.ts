import {
	Channel,
	Client,
	DMChannel,
	MessageManager,
	NewsChannel,
	TextChannel,
} from 'discord.js';
import { getContext, convertOutputToJSon, isTextChannel } from './utils';
import { respond } from './index';

import axios from 'axios';

class Bot {
	username: string;
	client: Client;

	constructor(username: string, token: string) {
		this.username = username;

		this.client = new Client();
		this.client.login(token);

		this.client.on('message', (msg) => {
			if (this.client.user && msg.mentions.has(this.client.user?.id)) {
				const prompt =
					msg.content.substr(msg.content.indexOf('>')) +
					' <|EOL|>\n' +
					this.username;
				console.log(prompt);
				axios
					.post('http://192.168.0.67:5000/generate', {
						text: prompt,
						length: 120,
					})
					.then((res) => {
						let data = JSON.stringify(res.data).substr(2);
						data = data.substr(0, data.length - 2);

						const obj = convertOutputToJSon(data, '');

						if (isTextChannel(msg.channel)) {
							//msg.reply(JSON.stringify(obj));
							respond(msg.channel, obj);
						}
					})
					.catch(console.error);
			}
		});
	}

	say(channel: TextChannel, msg: string) {
		this.client.channels.fetch(channel.id).then((c_channel) => {
			if (isTextChannel(c_channel)) {
				c_channel.send(msg);
			}
		});
	}
}

export default Bot;
