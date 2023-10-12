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
        const user = await userClient(ctx)
        const keyboard = meinMenuDisplay(user)
        const text = fix.textHello + '\n' + fix.textCallInfo
        await bot.telegram.sendMessage(ctx.from.id, text, {...keyboard, parse_mode: 'HTML'}).catch(fix.errorDone)
    }
    catch(e){
        console.log('Start\n', e)
    }
})

bot.on('message', async (ctx) => {
    try{
        const user = await userClient(ctx)
        if(user.currentStatus.split('|')[0] == 'askAccumModel' && ctx.message['text']){
            await bot.telegram.sendMessage(ctx.from.id, fix.border).catch(fix.errorDone)
            const result = (await resultSearch('Accum', ctx.message.text, 4)).filter(item => item.model.toLowerCase().includes(user.currentStatus.split('|')[1]))
            if(result.length !== 0){
                user.historyRequest.push(ctx.message.text)
                let step = 0
                for(let i of result){
                    let keyboard
                    step++
                    if(result.length == step && user.cart.length > 0){
                        keyboard = Markup.inlineKeyboard([
                            [Markup.button.callback(fix.inCart, `inCart|${i._id}|${i.price}`)],
                            [Markup.button.callback('Корзина', `cart`), Markup.button.callback(fix.textBack, `menu`)]
                        ]) 
                    }
                    else if(result.length == step){
                        keyboard = Markup.inlineKeyboard([
                            [Markup.button.callback(fix.inCart, `inCart|${i._id}|${i.price}`)],
                            [Markup.button.callback(fix.textBack, `menu`)]
                        ]) 
                    }
                    else{
                        keyboard = Markup.inlineKeyboard([
                            [Markup.button.callback(fix.inCart, `inCart|${i._id}|${i.price}`)]
                        ]) 
                    }
                    const text = i.model + '\n' + i.price
                    await bot.telegram.sendMessage(ctx.from.id, text, {...keyboard, parse_mode: 'HTML'}).catch(fix.errorDone)
                }
            }
            else{
                const keyboard = Markup.inlineKeyboard([Markup.button.callback(fix.textBack, `menu`)])
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

bot.on('callback_query', async (ctx) => {
    try{
        await ctx.answerCbQuery()
        let value = await ctx.update.callback_query.data
        const user = await userClient(ctx)
        let keyboard
        let text

        if(value == 'accumOrder'){
            await bot.telegram.sendMessage(ctx.from.id, fix.border).catch(fix.errorDone)
            keyboard = keyboardAccum(user, value)
            text = fix.textCheckModel
            user.currentStatus = 'viewAccumModelList'
        }
        else if(value.split('|')[1] == 'accumOrder' && fix.modelsDevicesTel.map(item => item.text).includes(value.split('|')[0])){
            await bot.telegram.sendMessage(ctx.from.id, fix.border).catch(fix.errorDone)
            keyboard = Markup.inlineKeyboard([Markup.button.callback(fix.textBack, `menu`)])
            text = value.split('|')[0] + '\n' + fix.textModelTel
            user.currentStatus = `askAccumModel|${value.split('|')[0]}`
        }
        else if(value == 'menu'){
            await bot.telegram.sendMessage(ctx.from.id, fix.border).catch(fix.errorDone)
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
            await bot.telegram.sendMessage(ctx.from.id, fix.border).catch(fix.errorDone)
            await meinCart(user, ctx)
            const summa = async () => {
                return await user.cart.map(item => item.price).reduce(function(a, b){return a + b}, 0)
            }
            text = `В корзине ${user.cart.length} товаров \nCумма ${await summa()} бел.руб.`
            keyboard = Markup.inlineKeyboard([[Markup.button.callback('Оформить всё', 'orderCartAll'), Markup.button.callback('Удалить всё', 'deleteCartAll')],[Markup.button.callback('Меню', `menu`)]])
        }
        else if(value.split('|')[0] == 'deleteFromCart'){
            await bot.telegram.sendMessage(ctx.from.id, fix.border).catch(fix.errorDone)
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
            await bot.telegram.sendMessage(ctx.from.id, fix.border).catch(fix.errorDone)
            user.cart = []
            await user.save()
            keyboard = meinMenuDisplay(user)
            text = fix.textHello + '\n' + fix.textCallInfo
            user.currentStatus = 'Menu'
        }

        await bot.telegram.sendMessage(ctx.from.id, text, {...keyboard, parse_mode: 'HTML'}).catch(fix.errorDone)
        await user.save()
    }
    catch(e){
        console.log('callback_query\n' + e)
    }
    
})

bot.launch(option)

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))