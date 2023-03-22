const TelegramApi = require('node-telegram-bot-api');
const {gameOptions, againOptions} = require('./options')
// const sequelize = require('./db');
// const UserModel = require('./models');

const token = '5961801294:AAEN0zObAcspJHc__ARaqXNLCR-zW3ABmmk';
const bot = new TelegramApi(token, {polling: true});
const chats = {};

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, `Сейчас я загадаю цифру от 0 до 9, а ты должен ее угадать!`);
    chats[chatId] = Math.floor(Math.random() * 10);
    await bot.sendMessage(chatId, 'Отгадывай', gameOptions);
};

const start = async () => {
    // try {
    //     await sequelize.authenticate()
    //     await sequelize.sync()
    // } catch (e) {
    //     console.log('Подключение к бд сломалось', e)
    // }

    await bot.setMyCommands([
        {command: '/start', description: 'Начальное приветствие'},
        {command: '/info', description: 'Получить информацию о пользователе'},
        {command: '/game', description: 'Игра угадай цифру'},
    ]);

    /*
    {
      message_id: 1,
      from: { id: 5729873758, is_bot: false, first_name: 'Павел', last_name: 'Борисов',  language_code: 'ru'  },
      chat: { id: 5729873758, first_name: 'Павел',  last_name: 'Борисов',  type: 'private' },
      date: 1679222623,
      text: '/start',
      entities: [ { offset: 0, length: 6, type: 'bot_command' } ]
    }
    */
    bot.on('message', async msg => {
        const  text = msg.text;
        const chatId = msg.chat.id;

        try {
            if(text === '/start'){
                // await UserModel.create({chatId})
                await bot.sendSticker(chatId, 'https://bestoftelegram.com/stickers/img/Meme_stickers/Meme_stickers1.jpg');
                return  bot.sendMessage(chatId, `Добро пожаловать в бот`);
            }
            if(text === '/info'){
                // const user = await UserModel.findOne({chatId})
                return bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name} ${msg.from.last_name}`);
            }
            if (text === '/game') {
                return startGame(chatId);
            }
            return bot.sendMessage(chatId, 'Я тебя не понимаю, попробуй еще раз!)');
        } catch (e) {
            return bot.sendMessage(chatId, 'Произошла какая то ошибочка!)')
        }
    });

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if (data === '/again') {
            return startGame(chatId)
        }
        // const user = await UserModel.findOne({chatId})
        if (data == chats[chatId]) {
            // user.right += 1;
            await bot.sendMessage(chatId, `Поздравляю, ты отгадал цифру ${chats[chatId]}`, againOptions);
        } else {
            // user.wrong += 1;
            await bot.sendMessage(chatId, `К сожалению ты не угадал, бот загадал цифру ${chats[chatId]}`, againOptions);
        }
        // await user.save();
    });
}

start();