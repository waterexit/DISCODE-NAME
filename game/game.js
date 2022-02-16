import { promises } from 'fs';

const blue = { text: '青チーム', value: 'blue' };
const red = { text: '赤チーム', value: 'red' };
const citizen = { text: '市民', value: 'citizen' };
const killer = { text: '暗殺者', value: 'killer' };

const blueMax = 9;
const redMax = 8;

export class Game {
    constructor() {
        this.field = []
        this.turn = blue

        this.blueCount = 0;
        this.redCount = 0;

        this.victory = null;
    }

    async start(words) {
        if(words < 25)
            throw new Error('単語は必ず25枚以上用意してください');

        async function createField() {
            const shuffle = ([...array]) => {
                for (let i = array.length - 1; i >= 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
                return array;
            }
            words = shuffle(words);
            let selectWords = words.slice(0, 25);
            this.field = selectWords.map((w, i) => {
                let color;
                if (i < redMax)
                    color = red.value;
                else if (i < redMax + blueMax)
                    color = blue.value;
                else if (i === redMax + blueMax)
                    color = killer.value;
                else
                    color = citizen.value;
                return { word: w, color: color, opened: false }
            });
            this.field = shuffle(this.field);
        }
        await createField.bind(this)();
        return this.createResponse("ゲームを開始しました。");
    }

    select(select) {
        if(filed[select].opened)
            return ;
        this.field[select].opened = true;

        const killerAnnounce = `${this.field[select].word}は**${killer.text}**でした！`;
        const redAnnounce = `${this.field[select].word}は**${red.text}**のスパイでした！`;
        const blueAnnounce = `${this.field[select].word}は**${blue.text}**のスパイでした！`;
        const citizenAnnounce = `${this.field[select].word}は**${citizen.text}**でした！`;

        switch (this.field[select].color) {
            case killer.value:
                if (this.turn.value === red.value)
                    this.victory = blue;
                else if (this.turn.value === blue.value)
                    this.victory = red;
                return this.finish(killerAnnounce);
            case red.value:
                this.redCount++;
                if (this.redCount === redMax) {
                    this.victory = red;
                    return this.finish(redAnnounce);
                }
                if (this.turn.value === blue.value)
                    this.change();
                return this.createResponse(redAnnounce);
            case blue.value:
                this.blueCount++;
                if (this.blueCount === blueMax) {
                    this.victory = blue;
                    return this.finish(blueAnnounce);
                }
                if (this.turn.value === red.value)
                    this.change();
                return this.createResponse(blueAnnounce);
            case citizen.value:
                this.change();
                return this.createResponse(citizenAnnounce);
        }
    }

    finish(announce) {
        for (let f of this.field)
            f.opened = true;
        return this.createResponse(`${announce}${this.victory.text}の勝利！\nゲームは終了しました`);
    }

    createResponse(message) {
        const situation = `現在のスコア\n青:${this.blueCount}/${blueMax}\n赤:${this.redCount}/${redMax}\n**${this.turn.text}のターンです。**\n\n${message}`;

        return { message: situation, field: this.field }
    }

    change() {
        if (this.turn.value === blue.value)
            this.turn = red;
        else if (this.turn.value === red.value)
            this.turn = blue;
    }

}
