import Bot from './bot';

export function getAllUserBots(): Map<string, Bot> {
	const bots = new Map<string, Bot>();
	bots.set(
		'INSERT_NAME', // This corresponds to the name that appears in the encoded message
		new Bot(
			'INSERT_NAME',
			'BOT_TOKEN' // Bot token
		)
	);
	// Repeat for all the bots

	return bots;
}

export const masterBotToken = 'INSERT_MASTER_BOT_TOKEN';
