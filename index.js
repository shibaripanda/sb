import 'dotenv/config'
import { Telegraf, Markup } from "telegraf"
import { db } from "./modules/db.js"
import { User } from "./models/User.js"
import { Device } from "./models/Device.js"
import { Accum } from "./models/Accum.js"
import { fix } from "./fixConst.js"
import { userClient } from "./modules/userClient.js"
import { upDateBaza } from "./modules/readExcel.js"

const bot = new Telegraf(process.env.BOT_TOKEN)
const option = {allowedUpdates: ['chat_member', 'callback_query', 'message', 'channel_post'], dropPendingUpdates: true}

async function test(){
    const status = await db()
    if(status){
        console.log((await Device.find({})).length, (await User.find({})).length, (await Accum.find({})).length)
    }
    // await Accum.deleteMany({})
    // await Device.deleteMany({})
    // await upDateBaza()
    // await Accum.deleteMany({})
    // await Device.deleteMany({})
    // console.log(await Device.findOne({model: 'Караоке микрофон WSTER WS-838 (original) салатовый'}))
    console.log((await Accum.find({})).length)
    console.log((await Device.find({})).length)

}

test()

bot.start(async (ctx) => {
    try{
        const user = await userClient(ctx)

        let keyboard = false

        console.log(user.requestMode)

        if(user.historyRequest.length == 0){
            keyboard = Markup.inlineKeyboard([
                [Markup.button.callback(fix.textHistoryRequest, `1`)]
            ])
        }
        const result = await bot.telegram.sendPhoto(ctx.from.id, {source: './images/1582.jpeg', ...keyboard, parse_mode: 'HTML', caption: 'Hello'}).catch(fix.errorDone)
        // await bot.telegram.sendMessage(ctx.from.id, fix.textHello + '\n' + fix.textCallInfo, {...keyboard, parse_mode: 'HTML'}).catch(fix.errorDone)
    }
    catch(e){
        console.log('Start\n', e)
    }
})

bot.on('message', async (ctx) => {
    try{
        const user = await userClient(ctx)

        if(user.requestMode && ctx.message['text']){
            const res = await Device.find({})
            console.log(res.length)
            const result = res.find(item => item.model.includes(ctx.message.text))
            const keyboard = false
            console.log(result)
            const mes = await bot.telegram.sendPhoto(ctx.from.id, {source: result.image, ...keyboard, parse_mode: 'HTML', caption: result.model}).catch(fix.errorDone)
            console.log(mes)
            // .then(async (res) => {
            //     console.log(res.length)
            //     const result = res.find(item => item.model.includes(ctx.message.text))
            //     console.log(result)
            //     const keyboard = false
            //     await bot.telegram.sendPhoto(ctx.from.id, {source: result.image, ...keyboard, parse_mode: 'HTML', caption: result.model}).catch(fix.errorDone)
            //     console.log(ctx.message.text)
            // })
        }
    }
    catch(e){
        console.log('Message\n', e)
    }
})

bot.launch(option)

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))