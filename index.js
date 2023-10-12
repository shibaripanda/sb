import 'dotenv/config'
import { Telegraf, Markup } from "telegraf"
import { db } from "./modules/db.js"
import { User } from "./models/User.js"
import { Device } from "./models/Device.js"
import { Accum } from "./models/Accum.js"
import { fix } from "./fixConst.js"
import { userClient } from "./modules/userClient.js"
import { upDateBaza } from "./modules/readExcel.js"
import { resultSearch } from './modules/searchModelDevice.js'

const bot = new Telegraf(process.env.BOT_TOKEN)
const option = {allowedUpdates: ['chat_member', 'callback_query', 'message', 'channel_post'], dropPendingUpdates: true}

async function test(){
    const status = await db()
    if(status){
        console.log('\n* * * * * * * * *')
        console.log('* Device: ' + await Device.find({}).countDocuments())
        console.log('* Accum: ' + await Accum.find({}).countDocuments())
        console.log('* User: ' + await User.find({}).countDocuments())
        console.log('*\n')
    }

    // const res = await resultSearch('Accum', 'BN43', 10)
    // console.log(res.length)
    // for (let i of res){
    //     console.log(i)
    // }

    // await Accum.deleteMany({})
    // await Device.deleteMany({})
    // await User.deleteMany({})

    // await upDateBaza()
}

test()

bot.start(async (ctx) => {
    try{
        const user = await userClient(ctx)

        let keyboard = false
        const keyboardArray = []
        for(let i of fix.modelsDevicesTel){
            keyboardArray.push([Markup.button.callback(i.name, i.text)])
        }
        if(user.historyRequest.length > 0){
            keyboardArray.push([Markup.button.callback(fix.textHistoryRequest, `1`)])     
        }
        keyboard = Markup.inlineKeyboard(keyboardArray)
        await bot.telegram.sendMessage(ctx.from.id, fix.textHello + '\n' + fix.textCallInfo, {...keyboard, parse_mode: 'HTML'}).catch(fix.errorDone)
    }
    catch(e){
        console.log('Start\n', e)
    }
})

bot.on('message', async (ctx) => {
    try{
        const user = await userClient(ctx)
        if(user.requestMode && ctx.message['text']){
            const result = (await resultSearch('Accum', ctx.message.text, 4)).filter(item => item.model.toLowerCase().includes('iphone'))
            if(result.length !== 0){
                user.historyRequest.push(ctx.message.text)
                for(let i of result){
                    const keyboard = Markup.inlineKeyboard([
                        [Markup.button.callback('Заказать', `1`)]
                    ])
                    const text = i.model + '\n' + i.price
                    await bot.telegram.sendMessage(ctx.from.id, text, {...keyboard, parse_mode: 'HTML'}).catch(fix.errorDone)
                }
            }
            else{
                const keyboard = false
                const text = fix.textNoResult
                await bot.telegram.sendMessage(ctx.from.id, text, {...keyboard, parse_mode: 'HTML'}).catch(fix.errorDone)
            }
        }
        await user.save()
    }
    catch(e){
        console.log('Message\n', e)
    }
})

bot.launch(option)

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))