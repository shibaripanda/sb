import 'dotenv/config'
import { Telegraf, Markup } from "telegraf"
import { db } from "./modules/db.js"
import { User } from "./models/User.js"
import { Device } from "./models/Device.js"
import { Accum } from "./models/Accum.js"
import { Data } from './models/Data.js'
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
import { orderMenu } from './modules/menuOrder.js'
import { dateAndTime } from './modules/dateTime.js'

const bot = new Telegraf(process.env.BOT_TOKEN)
const option = {allowedUpdates: ['chat_member', 'callback_query', 'message', 'channel_post'], dropPendingUpdates: true}

async function start(){
    const status = await db()
    if(status){
        console.log('\n* * * * * * * * *')
        console.log('* Device: ' + await Device.find({}).countDocuments())
        console.log('* Accum: ' + await Accum.find({}).countDocuments())
        console.log('* User: ' + await User.find({}).countDocuments())
        console.log('* Data: ' + await Data.findOne({data: 'data'}, {countUsers: 1, countOrders: 1, globalNumber: 1, _id: 0}))
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
        if(ctx.chat.id > 0){
            const user = await userClient(ctx)
            await bot.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id).catch(fix.errorDone)
            if(user.currentStatus !== 'zero'){  
                console.log(user.currentStatus)
                let result = {
                    keyboard: Markup.inlineKeyboard([
                        Markup.button.callback(fix.textBack, `menu`)
                    ]),
                    text: 'Нажми "Назад" и выбери пункт меню, в данный момент ввод текста не требуется'
            }
                if(user.currentStatus.split('|')[0] == 'askAccumModel' && ctx.message['text']){
                    const array = (await resultSearch('Accum', user.currentStatus.split('|')[1] + ' ' + ctx.message.text, 4))
                    user.bufferSearch = {item: array.map(item => String(item._id)), step: 0, len: array.length}
                    user.historyRequest.push(user.currentStatus.split('|')[1] + ' ' + ctx.message.text)
                    result = await pageSearchResultKeyboardAndText(user)
                }
                else if(['surname', 'name', 'lastname', 'tel', 'email', 'evropochta'].includes(user.currentStatus) && ctx.message['text']){
                    user[user.currentStatus].push(String(ctx.message.text))
                    result = await userInfo(user, ctx)
                }

                await bot.telegram.editMessageText(ctx.from.id, user.lastMes, 'q', result.text, {...result.keyboard, parse_mode: 'HTML'}).catch(fix.errorDone)
                await user.save()
            }
            else{
                console.log('zero')
            }
        }
    }
    catch(e){
        console.log('Message\n', e)
    }
})

bot.on('callback_query', async (ctx) => {
    try{
        await ctx.answerCbQuery()
        let value = await ctx.update.callback_query.data
        if(ctx.update.callback_query.message.chat.id > 0){
            // console.log(ctx.update)
            const user = await userClient(ctx)
            console.log('callback_query: ' + value)
            // console.log(user.orders)
            let keyboard = Markup.inlineKeyboard([
                Markup.button.callback(fix.textBack, `menu`)
            ])

            let text = 'Ошибка'

            console.log('1:' + user.orders.length)
            // user.orders = []
            // user.cart = []
            // await Data.updateOne({data: 'data'}, {countOrders: 1})

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
                user.currentStatus = 'zero'
            }
            else if(value.split('|')[0] == 'inCart'){

                const itemTest = value.split('|')[1]

                const curItem = await Accum.findOne({_id: itemTest})

                if(curItem){
                    const countItemsInCart = user.cart.find(item => item.origId == itemTest)
                    
                    if(countItemsInCart){
                        user.cart[user.cart.findIndex(item => item.origId == itemTest)].inch++
                        user.cart[user.cart.findIndex(item => item.origId == itemTest)].time.push(dateAndTime())
                        // user.cart[user.cart.findIndex(item => item.origId == itemTest)].time.push()
                        await User.updateOne({id: ctx.from.id}, {cart: user.cart})
                    }
                    else{
                        user.cart.push({
                                origId: String(curItem._id),
                                price: curItem.price,
                                inch: 1,
                                time: [dateAndTime()]
                            })
                    } 
                }

                const result = await pageSearchResultKeyboardAndText(user)
                keyboard = result.keyboard
                text = result.text
                user.currentStatus = 'zero'
            }
            else if(value.split('|')[0] == 'inCartinCart'){

                const itemTest = value.split('|')[1]

                const curItem = await Accum.findOne({_id: itemTest})

                if(curItem){
                    const countItemsInCart = user.cart.find(item => item.origId == itemTest)
                    
                    if(countItemsInCart){
                        user.cart[user.cart.findIndex(item => item.origId == itemTest)].inch++
                        user.cart[user.cart.findIndex(item => item.origId == itemTest)].time.push(dateAndTime())
                        await User.updateOne({id: ctx.from.id}, {cart: user.cart})
                    }
                    else{
                        user.cart.push({
                                origId: String(curItem._id),
                                price: curItem.price,
                                inch: 1,
                                time: [dateAndTime()]
                            })
                    }
                }

                const result = await pageCartKeyboardAndText(user)
                keyboard = result.keyboard
                text = result.text
                user.currentStatus = 'zero'
            }
            else if(value.split('|')[0] == 'deleteFromCart'){
                user.cart[user.cart.findIndex(item => item.origId == value.split('|')[1])].inch--
                user.cart[user.cart.findIndex(item => item.origId == value.split('|')[1])].time.splice(0, 1)
                
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
                user.currentStatus = 'zero'
            }
            else if(value.split('|')[0] == 'cancelOrder'){    
                if(user.orders[Number(value.split('|')[1])][0].status == 'Создан'){
                    await Data.updateOne({data: 'data'}, {$inc: {countOrders: -1}}) 
                    text = fix.textHello + '\n' + fix.textCallInfo + '\n\nВы отменили заказ!'
                    const keyboardAdmin = [
                        [{text: '❌❌❌❌❌', callback_data: `zero`}]
                    ]
                    await bot.telegram.editMessageReplyMarkup(process.env.TECH_CHAT, user.orders[Number(value.split('|')[1])][0].techMessage, 'q', {inline_keyboard: keyboardAdmin}).catch(fix.errorDone)
                    user.orders.splice(Number(value.split('|')[1]), 1)
                }
                else{
                    text = fix.textHello + '\n' + fix.textCallInfo + '\n\nНельзя отменить заказ!'
                }
                
                user.orderIndex = 0
                keyboard = await meinMenuDisplay(user)
                user.currentStatus = 'Menu'
            }
            else if(value == 'userData'){
                const result = await userInfo(user, ctx)
                keyboard = result.keyboard
                text = result.text
                user.currentStatus = 'zero'
            }
            else if(value == 'orderDone'){
                const result = await orderDone(user)
                keyboard = result.keyboard
                text = result.text
                const keyboardAdmin = Markup.inlineKeyboard([
                    Markup.button.callback('Обработка', `proccesOrder|${result.user}|${result.globalNumber}`)
                ])
                user.currentStatus = 'zero'
                const mes = await bot.telegram.sendMessage(process.env.TECH_CHAT, result.order + '\n\nГлобальный номер: ' + result.globalNumber, {...keyboardAdmin, parse_mode: 'HTML'}).catch(fix.errorDone)
                const dataForUp = user.orders[user.orders.findIndex(item => item[0].globalNumber == Number(result.globalNumber))]
                dataForUp[0].techMessage = mes.message_id
                user.orders[user.orders.findIndex(item => item[0].globalNumber == Number(result.globalNumber))] = dataForUp
                console.log(user.orders[user.orders.findIndex(item => item[0].globalNumber == Number(result.globalNumber))][0].techMessage)
            }
            else if(value.split('|')[0] == 'myOrders'){
                user.orderIndex = value.split('|')[1] ? user.orders.findIndex(item => item[0].globalNumber == Number(value.split('|')[1])) : 0
                const result = await orderMenu(user)
                keyboard = result.keyboard
                text = result.text
                user.currentStatus = 'zero'
            }
            else if(value.split('|')[0] == 'order'){
                user.orderHot = value
                const result = await userInfo(user, ctx)
                keyboard = result.keyboard
                text = result.text
                user.currentStatus = 'zero'
            }
            else if(value == 'deleteCartAll'){
                user.cart = []
                keyboard = await meinMenuDisplay(user)
                text = fix.textHello + '\n' + fix.textCallInfo
                user.currentStatus = 'Menu'
            }
            else if(value == 'nextCartItem' || value == 'prevCartItem'){
                if(value == 'nextCartItem'){
                    user.cartIndex++
                }
                else{
                    user.cartIndex--
                }
                const result = await pageCartKeyboardAndText(user)
                keyboard = result.keyboard
                text = result.text
                user.currentStatus = 'zero'
            }
            else if(value == 'nextOrderItem' || value == 'prevOrderItem'){
                if(value == 'nextOrderItem'){
                    user.orderIndex++
                }
                else{
                    user.orderIndex--
                }
                const result = await orderMenu(user)
                keyboard = result.keyboard
                text = result.text
                user.currentStatus = 'zero'
            }
            else if(value == 'nextSearchResult' || value == 'prevSearchResult'){
                if(value == 'nextSearchResult'){
                user.bufferSearch = {item: user.bufferSearch.item, step: user.bufferSearch.step + 1, len: user.bufferSearch.len} 
                }
                else{
                user.bufferSearch = {item: user.bufferSearch.item, step: user.bufferSearch.step - 1, len: user.bufferSearch.len} 
                }
                const result = await pageSearchResultKeyboardAndText(user)
                keyboard = result.keyboard
                text = result.text
                user.currentStatus = 'zero'
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
            // console.log(user.orders[0] ? user.orders[0]: 'пусто')
        }
        else{
            if(value.split('|')[0] == 'proccesOrder'){
                console.log('procc')
                const userClient = await User.findOne({id: Number(value.split('|')[1])})
                const dataUp = userClient.orders[userClient.orders.findIndex(item => item[0].globalNumber == Number(value.split('|')[2]))]
                dataUp[0].status = fix.statusOrder.status_2
                userClient.orders[userClient.orders.findIndex(item => item[0].globalNumber == Number(value.split('|')[2]))] = dataUp
                const keyboardAdmin = [
                    [{text: '✅Обработка', callback_data: `zero`}, {text: 'Отправлен', callback_data: `sendOrder|${Number(value.split('|')[1])}|${Number(value.split('|')[2])}`}]
                ]
                await ctx.editMessageReplyMarkup({inline_keyboard: keyboardAdmin}).catch(fix.errorDone)

                const keyboard_1 = Markup.inlineKeyboard([
                    Markup.button.callback('Заказы', `myOrders|${Number(value.split('|')[2])}`)
                ])

                await bot.telegram.editMessageText(userClient.id, userClient.lastMes, Number(value.split('|')[2]), 'Статус заказа изменился ✅', {...keyboard_1}).catch(fix.errorDone)
                await userClient.save()
            }
            else if(value.split('|')[0] == 'sendOrder'){
                console.log('procc')
                const userClient = await User.findOne({id: Number(value.split('|')[1])})
                const dataUp = userClient.orders[userClient.orders.findIndex(item => item[0].globalNumber == Number(value.split('|')[2]))]
                dataUp[0].status = fix.statusOrder.status_3
                userClient.orders[userClient.orders.findIndex(item => item[0].globalNumber == Number(value.split('|')[2]))] = dataUp
                const keyboardAdmin = [
                    [{text: '✅Обработка', callback_data: `zero`}, {text: '✅Отправлен', callback_data: `zero`}, {text: 'Прибыл', callback_data: `arrive|${Number(value.split('|')[1])}|${Number(value.split('|')[2])}`}]
                ]
                await ctx.editMessageReplyMarkup({inline_keyboard: keyboardAdmin}).catch(fix.errorDone)

                const keyboard_1 = Markup.inlineKeyboard([
                    Markup.button.callback('Заказы', `myOrders|${Number(value.split('|')[2])}`)
                ])

                await bot.telegram.editMessageText(userClient.id, userClient.lastMes, Number(value.split('|')[2]), 'Статус заказа изменился ✅', {...keyboard_1}).catch(fix.errorDone)
                await userClient.save()
            }
            else if(value.split('|')[0] == 'arrive'){
                console.log('procc')
                const userClient = await User.findOne({id: Number(value.split('|')[1])})
                const dataUp = userClient.orders[userClient.orders.findIndex(item => item[0].globalNumber == Number(value.split('|')[2]))]
                dataUp[0].status = fix.statusOrder.status_4
                userClient.orders[userClient.orders.findIndex(item => item[0].globalNumber == Number(value.split('|')[2]))] = dataUp
                const keyboardAdmin = [
                    [{text: '✅Обработка', callback_data: `zero`}, {text: '✅Отправлен', callback_data: `zero`}, {text: '✅Прибыл', callback_data: `zero`}],
                    [{text: 'Получен', callback_data: `recivedByClient|${Number(value.split('|')[1])}|${Number(value.split('|')[2])}`}, {text: 'Забили хуй', callback_data: `notRecivedByClient|${Number(value.split('|')[1])}|${Number(value.split('|')[2])}`}]
                ]
                await ctx.editMessageReplyMarkup({inline_keyboard: keyboardAdmin}).catch(fix.errorDone)

                const keyboard_1 = Markup.inlineKeyboard([
                    Markup.button.callback('Заказы', `myOrders|${Number(value.split('|')[2])}`)
                ])

                await bot.telegram.editMessageText(userClient.id, userClient.lastMes, Number(value.split('|')[2]), 'Статус заказа изменился ✅', {...keyboard_1}).catch(fix.errorDone)
                await userClient.save()
            }
        }
    }
    catch(e){
        console.log('callback_query\n' + e)
    }
    
})

bot.launch(option)

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))