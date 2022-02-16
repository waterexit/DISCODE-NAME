import { Game } from "../game/game.js";
import { MessageComponentParser } from "./MessageComponentParser.js";

class GameManager {
    constructor() {
        this.game = null;
        this.users = [];
        this.parser = new MessageComponentParser();
        this.interaction = null;
        this.collector = null;
        this.words = null;
    }

    async prepareGame(interaction) {
        this.interaction = interaction;
        const assignRoleComponent = this.parser.createAssignRoles('ゲーム開始前に役割を決めます。\n行いたい役割をクリックしてください');
        await this.interaction.reply(assignRoleComponent);
        const message = await this.interaction.fetchReply()
        let filter = i => i.message.id === message.id
        const collector = this.interaction.channel.createMessageComponentCollector({ filter: filter, dispose: true });

        this.collector = collector;

        function createMessage() {
            let blueSpyMaster = '青チームスパイマスター:';
            let blueAgent = '青チームエージェント:';
            let redSpyMaster = '赤チームスパイマスター:';
            let redAgent = '赤チームエージェント:';
            for (let user of this.users) {
                if (user.role === 'spyMaster' && user.team === 'blue')
                    blueSpyMaster += `<@${user.userInfo.id}> `;
                if (user.role === 'agent' && user.team === 'blue')
                    blueAgent += `<@${user.userInfo.id}>`;
                if (user.role === 'spyMaster' && user.team === 'red')
                    redSpyMaster += `<@${user.userInfo.id}>`;
                if (user.role === 'agent' && user.team === 'red')
                    redAgent += `<@${user.userInfo.id}>`;
            }
            return blueSpyMaster + '\n' + blueAgent + '\n' + redSpyMaster + '\n' + redAgent + '\n'
        }

        collector.on('collect', async i => {
            let role;
            let team;
            switch (i.customId) {
                case "blueSpyMaster":
                    role = 'spyMaster';
                    team = 'blue';
                    break;
                case "blueAgent":
                    role = 'agent';
                    team = 'blue';
                    break;
                case "redSpyMaster":
                    role = 'spyMaster';
                    team = 'red';
                    break;
                case "redAgent":
                    role = 'agent';
                    team = 'red';
                    break;
            }
            let userInfo = this.getUserInfo(i.user);
            if (userInfo === null) {
                this.users.push(new User(i.user, role, team));
            } else {
                userInfo.role = role;
                userInfo.team = team;
            }
            let message = createMessage.bind(this)();
            await i.update(this.parser.createAssignRoles(message))

        });

    }


    async gameStart(interaction) {
        if (!interaction) {
            throw new Error("start()を実行する前に必ずprepare()を実行してください");
        }
        if (!this.checkUsers()) {
            interaction.reply('それぞれの役職に対して最低1人の参加者がいなければゲームは開始できません。\n人数が揃うのを待つか、/endコマンドでゲームを終了してください');
            return;
        }
        await this.collector.stop();
        this.game = new Game();
        this.interaction = interaction;

        let firstComponent = this.parser.render(await this.game.start(this.words));

        this.interaction.reply(firstComponent);
        const message = await this.interaction.fetchReply()
        let filter = i => i.message.id === message.id
        const collector = this.interaction.channel.createMessageComponentCollector({ filter: filter, dispose: true });

        this.collector = collector;

        collector.on('collect', async i => {
            let userInfo = this.getUserInfo(i.user);
            if (userInfo !== null && userInfo.role === 'agent' && userInfo.team === this.game.turn.value) {
                let modifiedComponent = this.parser.render(this.game.select(i.customId));
                await i.update(modifiedComponent);
            } else {
                await i.reply(`<@${i.user.id}>、あなたは${this.game.turn.text}のエージェントではありません。`)
            }
        });

    }

    async createWords(text) {
        if (!text) {
            text = await promises.readFile("words/words.txt", "utf-8");
        }
        text = text.replace(/[\n\r]/g, '');
        this.words = text.split(',');
    }

    async checkWords() {
        return new Promise((resolved) => setTimeout(() => {
            console.log('ファイルの読み込み中…');
            if (!this.getWords())
                this.checkWords();
            else
                resolved();
        }, 1000));
    }

    async getWords() {
        return this.words !== null && this.words.length > 0;
    }

    async sendMasterSheet() {
        const masterSheet = this.parser.createMasterSheet(this.game.field);
        const spyMastersInfos = this.users.filter(u => u.role === 'spyMaster').map(u => u.userInfo);
        try {
            for (let spyMasterInfo of spyMastersInfos)
                await spyMasterInfo.send(masterSheet);
        } catch (error) {
            console.log(error);
            console.log('送信失敗');
        }
    }

    async close() {
        await this.interaction?.deleteReply()
        await this.collector?.stop();
    }

    getUserInfo(userInfo) {
        let targetUserInfo = this.users.filter(u => u.userInfo.id === userInfo.id);
        if (targetUserInfo.length > 1)
            throw new Error('予期せぬエラー:ユーザIDが一意ではありません。')
        if (targetUserInfo.length === 0)
            return null;
        return targetUserInfo[0];
    }

    checkUsers() {
        const blueSpyMasterFlg = this.users.filter(u => u.role === 'spyMaster' && u.team === 'blue').length !== 0;
        const blueAgentFlg = this.users.filter(u => u.role === 'agent' && u.team === 'blue').length !== 0;
        const redSpyMasterFlg = this.users.filter(u => u.role === 'spyMaster' && u.team === 'red').length !== 0;
        const redAgentFlg = this.users.filter(u => u.role === 'agent' && u.team === 'red').length !== 0;
        return blueSpyMasterFlg && blueAgentFlg && redSpyMasterFlg && redAgentFlg;
    }
}

class User {
    constructor(userInfo, role, team) {
        this.userInfo = userInfo;
        // spyMaster or agent
        this.role = role;
        // red or blue
        this.team = team
    }
}

export default GameManager; 