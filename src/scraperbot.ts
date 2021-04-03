import {
	Channel,
	Client,
	DMChannel,
	MessageManager,
	NewsChannel,
	TextChannel,
} from 'discord.js';
import { readMessages, getMessageChunk } from './read_messages';
import {
	ServerMessageData,
	MessageChannelData,
	MessageData,
} from './datatypes';
import fs from 'fs';
import { TSMap } from 'typescript-map';
import { encode, encodeWithChannelContext } from './encode';
import { isTextChannel, tempMessage } from './utils';

const data: ServerMessageData = new TSMap<string, MessageChannelData>();

// Read json file in sync
export function loadScraperCommands(client: Client) {
	const msg_data = fs.readFileSync('../messages.json');
	data.fromJSON(JSON.parse(msg_data.toString()));

	client.on('ready', () => {
		console.log('Scraper commands loaded');
	});

	client.on('message', (msg) => {
		//check its me 👀
		if (msg.author.id === '150049709698973696') {
			if (msg.content.startsWith('!gather')) {
				const args = msg.content.split(' ');
				const channelName = args[1];
				const chunkNumber = parseInt(args[2]);

				console.log(`channel: ${channelName}`);

				// If invalid, show "Invalid command" for 3 seconds
				if (channelName === undefined || isNaN(chunkNumber)) {
					tempMessage('Invalid command', msg.channel, 3000);
					msg.delete();
					return;
				}

				const channel = msg.guild?.channels.cache.find(
					(channel) => channel.name == channelName
				);
				const now = new Date();

				if (channel && isTextChannel(channel)) {
					// check server message data if channel is already saved
					let channeldata = data.get(channel.name);
					if (channeldata === undefined) {
						channeldata = new Array<MessageData>();
					}

					readMessages(channel, channeldata, chunkNumber)
						.catch((err) =>
							console.error(`[Error] Extracting messages: ${err}`)
						)
						.then(() => {
							if (isTextChannel(channel) && channeldata !== undefined) {
								data.set(channel.name, channeldata);
							}
							/*const finishtime = new Date();
						const diff = finishtime.getDate() - now.getDate();
						const mindiff = diff / (1000 * 60);*/
							msg.reply(
								`Finished gathering ${chunkNumber} chunk(s) in #${channel.name}.`
							);
							msg.delete();
						});
				} else {
					tempMessage("Couldn't find that channel :/", msg.channel, 5000);
				}
			}
			if (msg.content === '!save') {
				fs.writeFile(
					'../messages.json',
					JSON.stringify(data.toJSON()),
					(err) => {
						if (err) msg.channel.send(`Error saving: ${err}`);
						else tempMessage('Saved JSON', msg.channel, 3000);
					}
				);
				msg.delete();
			}
			if (msg.content == '!check') {
				tempMessage(JSON.stringify(data.toJSON()), msg.channel, 30000);
				msg.delete();
			}
			if (msg.content == '!stats') {
				let finalmsg = '';
				let totalmsg = 0;
				for (const [name, channeldata] of data.entries()) {
					const channellength = channeldata.length;
					finalmsg += `#${name} has ${channellength} messages gathered\n`;
					totalmsg += channellength;
				}
				finalmsg += `That's ${totalmsg} in total`;
				msg.channel.send(finalmsg);
			}
			if (msg.content == '!encode') {
				encode(data, '../encode_test.txt');
				encodeWithChannelContext(data, '../encode_test_channel.txt');
			}
			// (fuck jack)
			if (msg.content == 'peng') {
				msg.channel.send(
					'https://tenor.com/view/jack-pc-drop-poonani-aired-gif-19837340'
				);
				msg.delete();
			}
		}

		// Easter eggs xddddddddddddddd
		if (msg.content.startsWith('owo')) {
			msg.reply('uwu');
		} else if (msg.content.startsWith('!help')) {
			msg.reply('fuck you');
		} else if (msg.content.startsWith('bleep')) {
			msg.reply('bloop');
		} else if (msg.content.startsWith('pain')) {
			msg.channel.send('AHHHHHHHHHHHHHHHHHH');
			msg.delete();
		}
	});
}
