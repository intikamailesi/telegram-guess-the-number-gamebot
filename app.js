const GameBot = require('./Bot/GameBot.js');

const token = 'Insert your token here';

const bot = new GameBot(token, { polling: true });
