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
import { pageCartKeyboardAndText } from './modules/menuCart.js'
import { pageSearchResultKeyboardAndText } from './modules/pageSearchResult.js'
import { userInfo } from './modules/userInfo.js'
import { orderDone } from './modules/orderDone.js'

const bot = new Telegraf(process.env.BOT_TOKEN)
const option = {allowedUpdates: ['chat_member', 'callback_query', 'message', 'channel_post'], dropPendingUpdates: true}

async function start(){
    const status = await db()
    if(status){
        console.log('\n* * * * * * * * *')
        console.log('* Device: ' + await Device.find({}).countDocuments())
        console.log('* Accum: ' + await Accum.find({}).countDocuments())
        console.log('* User: ' + await User.find({}).countDocuments())
        console.log('*\n')
    }

    // await Accum.deleteMany({})
    // await Device.deleteMany({})
    // await User.deleteMany({})

    // await upDateBaza()
}

start()

bot.start(async (ctx) => {
    try{
        await bot.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id).catch(fix.errorDone)
        const user = await userClient(ctx)
        const keyboard = await meinMenuDisplay(user)
        const text = fix.textHello + '\n' + fix.textCallInfo

        if(user.startMes == 0){
            user.startMes = 1
        }
        else{
            user.startMes = user.startMes + 1
        }

        if(user.lastMes == 0 || user.startMes > 3){
            if(user.startMes > 3){
                await bot.telegram.editMessageText(ctx.from.id, user.lastMes, 'q', '.', {protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
                await bot.telegram.deleteMessage(ctx.from.id, user.lastMes).catch(fix.errorDone)
            }
            const mesText = await bot.telegram.sendMessage(ctx.from.id, text, {...keyboard, parse_mode: 'HTML'}).catch(fix.errorDone)
            user.lastMes = mesText.message_id
            user.startMes = 1
        }
        else{
            await bot.telegram.editMessageText(ctx.from.id, user.lastMes, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
        }
        await user.save()
    }
    catch(e){
        console.log('Start\n', e)
    }
})

bot.on('message', async (ctx) => {
    try{
        await bot.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id).catch(fix.errorDone)
        const user = await userClient(ctx)
        let result
        if(user.currentStatus.split('|')[0] == 'askAccumModel' && ctx.message['text']){
            const array = (await resultSearch('Accum', user.currentStatus.split('|')[1] + ' ' + ctx.message.text, 4))
            user.bufferSearch = {item: array.map(item => String(item._id)), step: 0, len: array.length}
            user.historyRequest.push(user.currentStatus.split('|')[1] + ' ' + ctx.message.text)
            result = await pageSearchResultKeyboardAndText(user)
        }
        else if(user.currentStatus == 'surname' || 'name' || 'lastname' || 'tel' || 'email' || 'evropochta' && ctx.message['text']){
            user[user.currentStatus].push(String(ctx.message.text))
            result = await userInfo(user, ctx)
        }

        await bot.telegram.editMessageText(ctx.from.id, user.lastMes, 'q', result.text, {...result.keyboard, parse_mode: 'HTML'}).catch(fix.errorDone)
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
        console.log('callback_query: ' + value)
        console.log(user.orders)
        let keyboard = Markup.inlineKeyboard([
            Markup.button.callback(fix.textBack, `menu`)
        ])
        let text = 'Ошибка'
        // user.orders = []

        if(value == 'accumOrder'){
            keyboard = await keyboardAccum(user, value)
            text = fix.textCheckModel
            user.currentStatus = 'viewAccumModelList'
        }
        else if(value.split('|')[1] == 'accumOrder' && fix.modelsDevicesTel.map(item => item.text).includes(value.split('|')[0])){
            keyboard = Markup.inlineKeyboard([Markup.button.callback(fix.textBack, `menu`)])
            text = value.split('|')[0] + '\n' + fix.textModelTel
            user.currentStatus = `askAccumModel|${value.split('|')[0]}`
        }
        else if(value == 'menu'){
            keyboard = await meinMenuDisplay(user)
            text = fix.textHello + '\n' + fix.textCallInfo
            user.currentStatus = 'Menu'
        }
        else if(value == 'cart'){
            user.cartIndex = 0
            const result = await pageCartKeyboardAndText(user)
            keyboard = result.keyboard
            text = result.text
        }
        else if(value.split('|')[0] == 'inCart'){

            const itemTest = value.split('|')[1]

            const curItem = await Accum.findOne({_id: itemTest})

            if(curItem){
                const countItemsInCart = user.cart.find(item => item.origId == itemTest)
                
                if(countItemsInCart){
                    user.cart[user.cart.findIndex(item => item.origId == itemTest)].inch++
                    await User.updateOne({id: ctx.from.id}, {cart: user.cart})
                }
                else{
                    user.cart.push({
                            origId: String(curItem._id),
                            price: curItem.price,
                            inch: 1
                        })
                } 
            }

            const result = await pageSearchResultKeyboardAndText(user)
            keyboard = result.keyboard
            text = result.text
        }
        else if(value.split('|')[0] == 'inCartinCart'){

            const itemTest = value.split('|')[1]

            const curItem = await Accum.findOne({_id: itemTest})

            if(curItem){
                const countItemsInCart = user.cart.find(item => item.origId == itemTest)
                
                if(countItemsInCart){
                    user.cart[user.cart.findIndex(item => item.origId == itemTest)].inch++
                    await User.updateOne({id: ctx.from.id}, {cart: user.cart})
                }
                else{
                    user.cart.push({
                            origId: String(curItem._id),
                            price: curItem.price,
                            inch: 1
                        })
                }
            }

            const result = await pageCartKeyboardAndText(user)
            keyboard = result.keyboard
            text = result.text
        }
        else if(value.split('|')[0] == 'deleteFromCart'){
            user.cart[user.cart.findIndex(item => item.origId == value.split('|')[1])].inch--
            
            if(user.cart[user.cart.findIndex(item => item.origId == value.split('|')[1])].inch == 0){
                user.cart.splice(user.cart.findIndex(item => item.origId == value.split('|')[1]), 1)
                if(user.cartIndex > 0){
                  user.cartIndex--   
                }
            }
            await User.updateOne({id: ctx.from.id}, {cart: user.cart})
            const result = await pageCartKeyboardAndText(user, ctx)
            keyboard = result.keyboard
            text = result.text
        }
        else if(value == 'userData'){
            const result = await userInfo(user, ctx)
            keyboard = result.keyboard
            text = result.text
        }
        else if(value == 'orderDone'){
            const result = await orderDone(user, ctx)
            keyboard = result.keyboard
            text = result.text
        }
        else if(value.split('|')[0] == 'order'){
            user.orderHot = value
            const result = await userInfo(user, ctx)
            keyboard = result.keyboard
            text = result.text
        }
        else if(value == 'deleteCartAll'){
            user.cart = []
            keyboard = await meinMenuDisplay(user)
            text = fix.textHello + '\n' + fix.textCallInfo
            user.currentStatus = 'Menu'
        }
        else if(value == 'nextCartItem'){
            user.cartIndex++
            const result = await pageCartKeyboardAndText(user)
            keyboard = result.keyboard
            text = result.text
        }
        else if(value == 'prevCartItem'){
            user.cartIndex--
            const result = await pageCartKeyboardAndText(user)
            keyboard = result.keyboard
            text = result.text
        }
        else if(value == 'nextSearchResult'){
            user.bufferSearch = {item: user.bufferSearch.item, step: user.bufferSearch.step + 1, len: user.bufferSearch.len}
            const result = await pageSearchResultKeyboardAndText(user)
            keyboard = result.keyboard
            text = result.text
        }
        else if(value == 'prevSearchResult'){
            user.bufferSearch = {item: user.bufferSearch.item, step: user.bufferSearch.step - 1, len: user.bufferSearch.len}
            const result = await pageSearchResultKeyboardAndText(user)
            keyboard = result.keyboard
            text = result.text
        }
        else if(['surname', 'name', 'lastname', 'tel', 'email', 'evropochta'].includes(value)){
            keyboard = Markup.inlineKeyboard([
                Markup.button.callback(fix.textBack, `userData`)
            ])
            text = 'Текущее значение: ' + user[value][user[value].length - 1] + '\n\n' + fix.askTextInfo[value]
            user.currentStatus = value
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