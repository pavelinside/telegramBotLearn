const TelegramBot = require('node-telegram-bot-api');
const {gameOptions, againOptions} = require('./options')
// const sequelize = require('./db');
// const UserModel = require('./models');
const express = require('express');
const cors = require('cors');

const token = '5961801294:AAEN0zObAcspJHc__ARaqXNLCR-zW3ABmmk';
const bot = new TelegramBot(token, {polling: true});
const chats = {};

//const webAppUrl = 'https://ornate-selkie-c27577.netlify.app';
const webAppUrl = 'https://google.com';
const app = express();
app.use(express.json());
app.use(cors());

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
                await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму', {
                    reply_markup: {
                        keyboard: [
                            [{text: 'Заполнить форму', web_app: {url: webAppUrl + '/form'}}]
                        ]
                    }
                });

                await bot.sendMessage(chatId, 'Заходи в наш интернет магазин по кнопке ниже', {
                    reply_markup: {
                        inline_keyboard: [
                            [{text: 'Сделать заказ', web_app: {url: webAppUrl}}]
                        ]
                    }
                });

                //await bot.sendSticker(chatId, 'https://bestoftelegram.com/stickers/img/Meme_stickers/Meme_stickers1.jpg');
                //return  bot.sendMessage(chatId, `Добро пожаловать в бот`);
            }
            if(text === '/info'){
                // const user = await UserModel.findOne({chatId})
                return bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name} ${msg.from.last_name}`);
            }
            if (text === '/game') {
                return startGame(chatId);
            }

            if(msg?.web_app_data?.data) {
                try {
                    const data = JSON.parse(msg?.web_app_data?.data)
                    console.log(data)
                    await bot.sendMessage(chatId, 'Спасибо за обратную связь!')
                    await bot.sendMessage(chatId, 'Ваша страна: ' + data?.country);
                    await bot.sendMessage(chatId, 'Ваша улица: ' + data?.street);

                    setTimeout(async () => {
                        await bot.sendMessage(chatId, 'Всю информацию вы получите в этом чате');
                    }, 3000)
                } catch (e) {
                    console.log(e);
                }
            }

            //return bot.sendMessage(chatId, 'Я тебя не понимаю, попробуй еще раз!)');
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

app.post('/web-data', async (req, res) => {
    const {queryId, products = [], totalPrice} = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {
                message_text: ` Поздравляю с покупкой, вы приобрели товар на сумму ${totalPrice}, ${products.map(item => item.title).join(', ')}`
            }
        })
        return res.status(200).json({});
    } catch (e) {
        return res.status(500).json({})
    }
});

start();

const PORT = 8000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT))