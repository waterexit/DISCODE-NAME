import { promises } from 'fs';

let data = await promises.readFile("words/words.txt", "utf-8");
data = data.replace(/\n/g, 'a');

let words = data.split(',');
console.log(words);