import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import request from 'request';
import dotenv from 'dotenv';
dotenv.config();
const [clientId, guildId, token] = [process.env.CLIENT_ID, process.env.GUILD_ID, process.env.TOKEN];

const commands = [
    new SlashCommandBuilder().setName('prepare').setDescription('ゲーム開始前に参加者と役職を決定します')
    .addStringOption(o =>o.setName('input')
			.setDescription('The input to echo back')
			.setRequired(false)),
    // new SlashCommandBuilder().setName('start').setDescription('ゲームを開始します'),
    new SlashCommandBuilder().setName('restart').setDescription('同じ役職で再度ゲームを行います'),
    new SlashCommandBuilder().setName('end').setDescription('現在のゲームを終了します'),

]
    .map(command => {
        return command.toJSON()});

const rest = new REST({ version: '9' }).setToken(token);

await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
.then(() => console.log('Successfully registered application commands.'))
.catch(e =>console.log(e.requestBody.json));


let  json = {
    "name": "start",
    "type": 1,
    "description": "ゲームを開始します",
    "options": [
        {
            "name": "words_file",
            "description": "独自のワードファイルを使用したい場合はファイルを送信してください",
            "type": 11,
            "required": false
        }
    ]
}
let url = `https://discord.com/api/v8/applications/${clientId}/guilds/${guildId}/commands`
let headers = {
    "Authorization": `Bot ${token}`
}

let r = request.post({url:url, headers:headers, json:json},(e,r,b) => console.log(b));
