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
import { meinMenuDisplay } from './modules/meimMenu.js'
import { keyboardAccum } from './modules/menuAccum.js'
import { meinCart } from './modules/menuCart.js'

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
        await bot.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id).catch(fix.errorDone)
        const user = await userClient(ctx)
        console.log(user.startMes)
        const keyboard = meinMenuDisplay(user)
        const text = fix.textHello + '\n' + fix.textCallInfo

        // user.startMes = 0
        //     user.save()

        if(user.startMes == 0){
            user.startMes = 1
            user.save()
        }
        else{
            user.startMes = user.startMes + 1
            user.save()
        }

        if(user.lastMes == 0 || user.startMes > 3){
            if(user.startMes > 3){
                await bot.telegram.deleteMessage(ctx.from.id, user.lastMes).catch(fix.errorDone)
            }
            const mesText = await bot.telegram.sendMessage(ctx.from.id, text, {...keyboard, parse_mode: 'HTML'}).catch(fix.errorDone)
            user.lastMes = mesText.message_id
            user.startMes = 1
            user.save()
        }
        else{
            await bot.telegram.editMessageText(ctx.from.id, user.lastMes, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
        }
    }
    catch(e){
        console.log('Start\n', e)
    }
})

bot.on('message', async (ctx) => {
    try{
        await bot.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id).catch(fix.errorDone)
        const user = await userClient(ctx)
        if(user.currentStatus.split('|')[0] == 'askAccumModel' && ctx.message['text']){
            // await bot.telegram.sendMessage(ctx.from.id, fix.border).catch(fix.errorDone)
            user.bufferSearch = {item: (await resultSearch('Accum', ctx.message.text, 4)).filter(item => item.model.toLowerCase().includes(user.currentStatus.split('|')[1])), step: 0}
            if(user.bufferSearch.item.length !== 0){
                user.historyRequest.push(ctx.message.text)
                    let keyboard
                    if(user.cart.length > 0){
                        keyboard = Markup.inlineKeyboard([
                            [Markup.button.callback('Корзина', `cart`), Markup.button.callback(fix.textBack, `menu`)],
                            [Markup.button.callback(fix.inCart, `inCart|${user.bufferSearch.item[user.bufferSearch.step]._id}|${user.bufferSearch.item[user.bufferSearch.step].price}`)],
                            [Markup.button.callback('Корзина', `cart`), Markup.button.callback(fix.textBack, `menu`)]
                        ]) 
                    }
                    else{
                        keyboard = Markup.inlineKeyboard([
                            [Markup.button.callback('Корзина', `cart`), Markup.button.callback(fix.textBack, `menu`)],
                            [Markup.button.callback(fix.inCart,  `inCart|${user.bufferSearch.item[user.bufferSearch.step]._id}|${user.bufferSearch.item[user.bufferSearch.step].price}`)]
                        ]) 
                    }
                    const text = user.bufferSearch.item[user.bufferSearch.step].model + '\n' + user.bufferSearch.item[user.bufferSearch.step].price
                    await bot.telegram.editMessageText(ctx.from.id, user.lastMes, 'q', text, {...keyboard, parse_mode: 'HTML'}).catch(fix.errorDone)
            }
            else{
                const keyboard = Markup.inlineKeyboard([Markup.button.callback(fix.textBack, `menu`)])
                const text = fix.textNoResult
                await bot.telegram.editMessageText(ctx.from.id, user.lastMes, 'q', text, {...keyboard, parse_mode: 'HTML'}).catch(fix.errorDone)
            }
        }
        await user.save()
    }
    catch(e){
        console.log('Message\n', e)
    }
})

bot.on('callback_query', async (ctx) => {
    try{
        await ctx.answerCbQuery()
        let value = await ctx.update.callback_query.data
        const user = await userClient(ctx)
        let keyboard
        let text

        if(value == 'accumOrder'){
            // await bot.telegram.sendMessage(ctx.from.id, fix.border).catch(fix.errorDone)
            keyboard = keyboardAccum(user, value)
            text = fix.textCheckModel
            user.currentStatus = 'viewAccumModelList'
        }
        else if(value.split('|')[1] == 'accumOrder' && fix.modelsDevicesTel.map(item => item.text).includes(value.split('|')[0])){
            // await bot.telegram.sendMessage(ctx.from.id, fix.border).catch(fix.errorDone)
            keyboard = Markup.inlineKeyboard([Markup.button.callback(fix.textBack, `menu`)])
            text = value.split('|')[0] + '\n' + fix.textModelTel
            user.currentStatus = `askAccumModel|${value.split('|')[0]}`
        }
        else if(value == 'menu'){
            // await bot.telegram.sendMessage(ctx.from.id, fix.border).catch(fix.errorDone)
            keyboard = meinMenuDisplay(user)
            text = fix.textHello + '\n' + fix.textCallInfo
            user.currentStatus = 'Menu'
        }
        else if(value.split('|')[0] == 'inCart'){
            // await bot.telegram.sendMessage(ctx.from.id, fix.border).catch(fix.errorDone)
            user.cart.push({item: value.split('|')[1], price: Number(value.split('|')[2])})
            await user.save()
            const summa = async () => {
                return await user.cart.map(item => item.price).reduce(function(a, b){return a + b}, 0)
            }
            keyboard =  Markup.inlineKeyboard([Markup.button.callback('Корзина', `cart`), Markup.button.callback('Оформить', `menu`), Markup.button.callback('Меню', `menu`)])
            text = `В корзине ${user.cart.length} товаров \nCумма ${await summa()} бел.руб.`
        }
        else if(value == 'cart'){
            // await bot.telegram.sendMessage(ctx.from.id, fix.border).catch(fix.errorDone)
            await meinCart(user, ctx)
            const summa = async () => {
                return await user.cart.map(item => item.price).reduce(function(a, b){return a + b}, 0)
            }
            text = `В корзине ${user.cart.length} товаров \nCумма ${await summa()} бел.руб.`
            keyboard = Markup.inlineKeyboard([[Markup.button.callback('Оформить всё', 'orderCartAll'), Markup.button.callback('Удалить всё', 'deleteCartAll')],[Markup.button.callback('Меню', `menu`)]])
        }
        else if(value.split('|')[0] == 'deleteFromCart'){
            // await bot.telegram.sendMessage(ctx.from.id, fix.border).catch(fix.errorDone)
            const index = user.cart.findIndex(item => item.item == value.split('|')[1])
            user.cart.splice(index, 1)
            await user.save()
            await meinCart(user, ctx)
            const summa = async () => {
                return await user.cart.map(item => item.price).reduce(function(a, b){return a + b}, 0)
            }
            text = `В корзине ${user.cart.length} товаров \nCумма ${await summa()} бел.руб.`
            keyboard = Markup.inlineKeyboard([[Markup.button.callback('Оформить всё', 'orderCartAll'), Markup.button.callback('Удалить всё', 'deleteCartAll')],[Markup.button.callback('Меню', `menu`)]])
        }
        else if(value == 'deleteCartAll'){
            // await bot.telegram.sendMessage(ctx.from.id, fix.border).catch(fix.errorDone)
            user.cart = []
            await user.save()
            keyboard = meinMenuDisplay(user)
            text = fix.textHello + '\n' + fix.textCallInfo
            user.currentStatus = 'Menu'
        }

        await bot.telegram.editMessageText(ctx.from.id, user.lastMes, 'q', text, {...keyboard, parse_mode: 'HTML'}).catch(fix.errorDone)
        await user.save()
    }
    catch(e){
        console.log('callback_query\n' + e)
    }
    
})

bot.launch(option)

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))