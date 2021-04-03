import { TSMap } from 'typescript-map';
import fs from 'fs';
import {
	MessageChannelData,
	MessageData,
	ServerMessageData,
} from './datatypes';

const channeldivider = '==============================';

export function encode(data: ServerMessageData, fileName: string) {
	let filedata = channeldivider + '\n';
	for (const [name, channeldata] of data.entries()) {
		filedata += '<|channelstart|> ' + name + '\n';
		for (let msgIndex = channeldata.length - 1; msgIndex >= 0; msgIndex--) {
			const msg = channeldata[msgIndex] as MessageData;
			if (msg.content === '') {
				continue;
			}
			filedata +=
				msg.author.replace(' ', '') + ': ' + msg.content + ' <|EOL|>\n';
		}
		filedata += channeldivider + '\n';
	}
	fs.writeFile(fileName, filedata, (err) => {
		if (err) console.error(`Error Encoding: ${err}`);
		console.log('Finished encoding');
	});
	return;
}

export function encodeWithChannelContext(
	data: ServerMessageData,
	fileName: string
) {
	let filedata = channeldivider + '\n';
	for (const [name, channeldata] of data.entries()) {
		let channelNameToken = name as string;
		channelNameToken = '<|' + channelNameToken.toUpperCase() + '|> ';

		for (let msgIndex = channeldata.length - 1; msgIndex >= 0; msgIndex--) {
			const msg = channeldata[msgIndex] as MessageData;
			if (msg.content === '') {
				continue;
			}
			filedata +=
				channelNameToken +
				msg.author.replace(' ', '') +
				': ' +
				msg.content +
				' <|EOL|>\n';
		}
		filedata += channeldivider + '\n';
	}
	fs.writeFile(fileName, filedata, (err) => {
		if (err) console.error(`Error Encoding: ${err}`);
		console.log('Finished encoding');
	});
	return;
}
