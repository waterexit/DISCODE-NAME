import axios from 'axios';
import { Client, Intents } from 'discord.js';
import dotenv from 'dotenv';
import GameManager from './gameManager.js';
dotenv.config();
const token = process.env.TOKEN;

let gameManagerMap = new Map();
// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
// When the client is ready, run this code (only once)
client.on('ready', () => {
	console.log('Ready!');
	client.ws.on('INTERACTION_CREATE', async interaction => {
		let attachments = interaction.data.resolved?.attachments;
		if (interaction.data.name === 'start') {
			let gameManager = gameManagerMap.get(interaction.channel_id);
			if (gameManager && attachments) {
				try {
					let url = attachments[interaction.data.options[0].value].url;
					if (url) {
						axios
							.get(url)
							.then(res => {
								gameManager.createWords(res.data);
							})
							.catch(error => {
								console.error(error)
							})
					}
				} catch (error) {
					interaction.reply('渡されたファイルの形式が不正です。/nカンマ区切りかどうか、単語数が足りているかなどを確認してください')
				}
			} else if (gameManager && !attachments) {
				gameManager.createWords();
			}
		}
	});
}); 
   

  client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	try {
		if (interaction.commandName === 'prepare') {
			let gameManager = new GameManager();
			gameManagerMap.set(interaction.channelId, gameManager);
			gameManager.prepareGame(interaction);
		} else if (interaction.commandName === 'start') {
			let gameManager = gameManagerMap.get(interaction.channelId);
			if (!gameManager) {
				interaction.reply('ゲームを開始するには先に/prepareコマンドを実行してください')
				return;
			} else {
				await gameManager.checkWords();
				gameManager.gameStart(interaction);
			}
		} else if (interaction.commandName === 'end') {
			let gameManager = gameManagerMap.get(interaction.channelId);
			if (gameManager) {
				console.log('end');
				gameManager.close();
			}
			gameManagerMap.set(interaction.channelId, null);
			interaction.reply('ゲームを終了しました')
		}
	} catch (error) {
		console.log(error);
		interaction.reply("不明なエラーが発生しました。もう一度最初からやり直してください")
	}
});


// Login to Discord with your client's token
client.login(token);