import { MessageActionRow, MessageButton } from 'discord.js';

const masterEmoji ='🤠'
const agentEmoji ='😎'

export class MessageComponentParser {
    constructor() {
    }

    createAssignRoles(message) {
        
        let messageComponents = [];
        const row1 = new MessageActionRow();
        const blueSpyMaster = new MessageButton()
                    .setCustomId(`blueSpyMaster`)
                    .setLabel(`スパイマスター${masterEmoji}`)
                    .setStyle(`PRIMARY`)
        row1.addComponents(blueSpyMaster)
        messageComponents.push(row1);

        const row2 = new MessageActionRow();
        const blueAgent = new MessageButton()
                    .setCustomId(`blueAgent`)
                    .setLabel(`エージェント${agentEmoji}`)
                    .setStyle(`PRIMARY`)
        row2.addComponents(blueAgent);
        messageComponents.push(row2);

        const row3 = new MessageActionRow();
        const redSpyMaster = new MessageButton()
                    .setCustomId(`redSpyMaster`)
                    .setLabel(`スパイマスター${masterEmoji}`)
                    .setStyle(`DANGER`)
        row3.addComponents(redSpyMaster);
        messageComponents.push(row3);

        const row4 = new MessageActionRow();
        const redAgent = new MessageButton()
                    .setCustomId(`redAgent`)
                    .setLabel(`エージェント${agentEmoji}`)
                    .setStyle(`DANGER`)
        row4.addComponents(redAgent);
        messageComponents.push(row4);
        
        return { content: message, components: [...messageComponents] };
    }

    render(gameResponse) {
        let field = gameResponse.field;
        let messageComponents = [];
        const style = {
            red: "DANGER",
            blue: "PRIMARY",
            citizen: "SUCCESS",
            killer: "SECONDARY"
        }
        for (let i = 0; i < 5; i++) {
            const row = new MessageActionRow();
            for (let l = 0 + (i * 5); l < (i + 1) * 5; l++) {

                const word = new MessageButton()
                    .setCustomId(`${l}`)
                    .setLabel(`${field[l].word}`)
                    .setStyle(`${field[l].opened ? style[field[l].color] : "SECONDARY"}`)
                    .setDisabled(`${field[l].opened}`);
                row.addComponents(word);
            }
            messageComponents.push(row);
        }

        return { content: gameResponse.message, components: [...messageComponents] };
    }
    createMasterSheet(field) {
        let messageComponents = [];
        const style = {
            red: "DANGER",
            blue: "PRIMARY",
            citizen: "SUCCESS",
            killer: "SECONDARY"
        }
        for (let i = 0; i < 5; i++) {
            const row = new MessageActionRow()
            for (let l = 0 + (i * 5); l < (i + 1) * 5; l++) {

                const word = new MessageButton()
                    .setCustomId(`${l}`)
                    .setLabel(`${field[l].word}`)
                    .setStyle(`${style[field[l].color]}`)
                    .setDisabled(true);
                row.addComponents(word);
            }
            messageComponents.push(row);
        }

        return { content: "今回のゲームで使用するシートです", components: [...messageComponents] };
    }
}