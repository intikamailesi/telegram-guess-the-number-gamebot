const TelegramBot = require('node-telegram-bot-api');

module.exports = class GameBot extends TelegramBot {
    constructor(token, options) {
        super(token, options);

        this.participants = new Map();

        this.numbers = new Map();

        this.number = this.getRandom();

        this.on('callback_query', this.newSession.bind(this));

        this.onText(/\/start/, this.start.bind(this));

        this.onText(/^[0-9]{4}$/, this.answer.bind(this));

    };

    answer(msg) {
        if(this.participants.get(msg.from.id) === undefined) {
            return this.sendMessage(msg.from.id, msg.text == this.numbers.get(msg.from.id) ? "You are correct! The number was " + msg.text + "! To start again type /start." : this.getHint(this.numbers.get(msg.from.id), msg.text));
        }

        if(msg.text == this.number) {
            this.number = this.getRandom();
            return this.notifyParticipants(this.participants.get(msg.from.id) + " wins! The number was " + this.number + ". Now I think about new number.") ;
        }

        this.notifyParticipants(this.participants.get(msg.from.id) + " answers " + msg.text + ", but misses! Hint: "  + this.getHint(this.number, msg.text));
        
    };

    getHint(number, assumption) {
        let hint = "";
        let digits = assumption.toString().split('');
        for(let key in digits) {
            let index = number.toString().indexOf(digits[key]);
            if(index == key) {
                hint += "B";
            } else if(index != -1 && index != key) {
                hint += "K";
            } else {
                hint += "*";
            }
        }
        return hint;
    };

    getRandom() {
        return Math.floor(Math.random() * 9000) + 1000;
    };

    start(msg, match) {
        let keyboardStr = JSON.stringify({
            inline_keyboard: [
                [{ 
                    text:'Single player', callback_data: 'single'
                }, { 
                    text:'Multiplayer', callback_data: 'multi'
                }]
            ]
        });
         
        let keyboard = { reply_markup: JSON.parse(keyboardStr) };

        this.sendMessage(msg.from.id, "What type of the game would you like to play?", keyboard);
    };

    newSession(cq) {
        this.participants.delete(cq.from.id);
        this.numbers.delete(cq.from.id);

        if(cq.data == 'single') {
            this.numbers.set(cq.from.id, this.getRandom());
            return this.sendMessage(cq.from.id, "I think of a new number. Can you guess it? Only 4 digit numbers allowed.", {
                parse_mode: "HTML"
            });
        }

        this.participants.set(cq.from.id, cq.from.first_name + " " + cq.from.last_name);
        this.sendMessage(cq.from.id, "Be the first one to guess the number! Only 4 digit numbers allowed.", {
            parse_mode: "HTML"
        });
    };

    notifyParticipants(msg) {
        for(let [key, value] of this.participants) {
            this.sendMessage(key, msg);
        }        
    };
};