import 'dotenv/config'
import { Telegraf, Markup } from "telegraf"
import { db } from "./modules/db.js"
import { User } from "./modules/models/User.js"
import { Device } from "./modules/models/Device.js"
import { Accum } from "./modules/models/Accum.js"
import { Data } from './modules/models/Data.js'
import { userClient } from "./modules/userClient.js"
import { upDateBaza } from "./modules/readExcel.js"
import { resultSearch } from './modules/searchModelDevice.js'
import { meinMenuDisplay } from './modules/menuModules/meimMenu.js'
import { keyboardAccum } from './modules/menuModules/menuAccum.js'
import { pageCartKeyboardAndText } from './modules/menuModules/menuCart.js'
import { pageSearchResultKeyboardAndText } from './modules/pageSearchResult.js'
import { userInfo } from './modules/userInfo.js'
import { orderDone } from './modules/orderDone.js'
import { orderMenu } from './modules/menuModules/menuOrder.js'
import { dateAndTime } from './modules/dateTime.js'
import { arhivMenu } from './modules/menuModules/menuArhiv.js'
// import { track } from './modules/track17.js'
import { fix } from "./modules/fixConst.js"



async function start(){

    const bot = []
    const option = {allowedUpdates: ['chat_member', 'callback_query', 'message', 'channel_post'], dropPendingUpdates: true}

    const lobbiText = fix.textHello + '\n\n' + fix.infoUslugi + '\n\n' + fix.infoCompany + '\n' + fix.infoTelefon  + '\n\n' + fix.textCallInfo

    for (let i = 0; i == i; i++){
        const botId = `BOT_TOKEN_` + i
        if(process.env[botId]){
          bot.push(new Telegraf(process.env[botId]))
        //   console.log(bot[i])
          console.log(`Bot ${i + 1} is alive!`)  
        }
        else{
            break
        } 
    }

    
    const status = await db()
   
    // await Accum.deleteMany({})
    // await Device.deleteMany({})
    
    // await upDateBaza()

    if(status){
        // finData = await Data.findOne({data: 'data'})
        console.log('\n* * * * * * * * *')
        console.log('* Device: ' + await Device.find({}).countDocuments())
        console.log('* Accum: ' + await Accum.find({}).countDocuments())
        console.log('* User: ' + await User.find({}).countDocuments())
        console.log('* Data: ' + await Data.findOne({data: 'data'}, {countUsers: 1, countOrders: 1, globalNumber: 1, _id: 0 , skv: 1, profit: 1, ship: 1}))
        console.log('* * * * * * * * *\n')
    }

    // await User.deleteMany({})

    for(let i of bot){

        const index = bot.indexOf(i)

        bot[index].start(async (ctx) => {
            try{
                await bot[index].telegram.deleteMessage(ctx.chat.id, ctx.message.message_id).catch(fix.errorDone)
                const user = await userClient(ctx)
                const keyboard = await meinMenuDisplay(user)
                const text = lobbiText

                if(user.startMes == 0){
                    user.startMes = 1
                }
                else{
                    user.startMes = user.startMes + 1
                }

                if(user.lastMes == 0 || user.startMes > 3){
                    if(user.startMes > 3){
                        await bot[index].telegram.editMessageText(ctx.from.id, user.lastMes, 'q', '.', {protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
                        await bot[index].telegram.deleteMessage(ctx.from.id, user.lastMes).catch(fix.errorDone)
                    }
                    const mesText = await bot[index].telegram.sendMessage(ctx.from.id, text, {...keyboard, parse_mode: 'HTML'}).catch(fix.errorDone)
                    user.lastMes = mesText.message_id
                    user.startMes = 1
                }
                else{
                    await bot[index].telegram.editMessageText(ctx.from.id, user.lastMes, 'q', text, {...keyboard, protect_content: true, disable_web_page_preview: true, parse_mode: 'HTML'}).catch(fix.errorDone)
                }
                await user.save()
            }
            catch(e){
                console.log('Start\n', e)
            }
        })

        bot[index].on('message', async (ctx) => {
            try{
                console.log(ctx.from.id)
                if(ctx.chat.id > 0){
                    const user = await userClient(ctx)
                    await bot[index].telegram.deleteMessage(ctx.chat.id, ctx.message.message_id).catch(fix.errorDone)
                    if(user.currentStatus !== 'zero'){  
                        console.log(user.currentStatus)
                        let result = {
                            keyboard: Markup.inlineKeyboard([
                                Markup.button.callback(fix.textBack, `menu`)
                            ]),
                            text: 'Нажми "Назад" и выбери пункт меню, в данный момент ввод текста не требуется'
                        }
                        if(user.currentStatus.split('|')[0] == 'askAccumModel' && ctx.message['text']){

                            const array = (await resultSearch('Accum', ctx.message.text, 5)).filter(item => item.model.toLowerCase().includes(user.currentStatus.split('|')[1]))

                            user.bufferSearch = {item: array.map(item => String(item._id)), step: 0, len: array.length}
                            user.historyRequest.push(user.currentStatus.split('|')[1] + ' ' + ctx.message.text)
                            result = await pageSearchResultKeyboardAndText(user)
                        }
                        else if(['surname', 'name', 'lastname', 'tel', 'email', 'evropochta'].includes(user.currentStatus) && ctx.message['text']){
                            user[user.currentStatus].push(String(ctx.message.text))
                            result = await userInfo(user, ctx)
                        }
                        else if(ctx.message['text'] && (ctx.message.text.split('|')[0]).toLowerCase() == 'up' && (await Data.findOne({data: 'data'})).admins.includes(ctx.from.id)){
                            console.log('redact')

                            await Data.updateOne({data: 'data'}, {[ctx.message.text.split('|')[1]]: Number(ctx.message.text.split('|')[2])})
                            const data = await Data.findOne({data: 'data'})
                            result.text = 'Установлен: ' + data[ctx.message.text.split('|')[1]] + ' ' + fix.valut
                        }

                        await bot[index].telegram.editMessageText(ctx.from.id, user.lastMes, 'q', result.text, {...result.keyboard, parse_mode: 'HTML'}).catch(fix.errorDone)
                        await user.save()
                    }
                    else{
                        console.log('zero')
                    }
                }
                else{
                    
                }
            }
            catch(e){
                console.log('Message\n', e)
            }
        })

        bot[index].on('callback_query', async (ctx) => {
            try{
                await ctx.answerCbQuery()
                let value = await ctx.update.callback_query.data
                if(ctx.update.callback_query.message.chat.id > 0){
                    // console.log(ctx.update)
                    const user = await userClient(ctx)
                    console.log('c_q: ' + value)
                    // console.log(user.orders)
                    let keyboard = Markup.inlineKeyboard([
                        Markup.button.callback(fix.textBack, `menu`)
                    ])

                    let text = 'Ошибка'

                    // console.log('1:' + user.orders.length)
                    // user.orders = []
                    // user.cart = []
                    // user.ordersArhiv = []
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
                        text = lobbiText
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
                        const ar = user.orders[Number(value.split('|')[1])][0].status
                        if((ar[ar.length - 1]).split(' / ')[0] == 'Создан'){
                            await Data.updateOne({data: 'data'}, {$inc: {countOrders: -1}}) 
                            text = fix.textHello + '\n' + fix.textCallInfo + '\n\nВы отменили заказ!'
                            const keyboardAdmin = [
                                [{text: '❌❌❌❌❌', callback_data: `zero`}]
                            ]
                            await bot[index].telegram.editMessageReplyMarkup(process.env.TECH_CHAT, user.orders[Number(value.split('|')[1])][0].techMessage, 'q', {inline_keyboard: keyboardAdmin}).catch(fix.errorDone)
                            user.orders.splice(Number(value.split('|')[1]), 1)
                        }
                        else{
                            text = lobbiText + '\n\nНельзя отменить заказ!'
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
                            [Markup.button.callback('Отменен поставщиком', `cancelByShop|${result.user}|${result.globalNumber}`), Markup.button.callback('Отменен заказчиком', `cancelByClient|${result.user}|${result.globalNumber}`)],
                            [Markup.button.callback('Обработка', `proccesOrder|${result.user}|${result.globalNumber}`)]
                        ])
                        user.currentStatus = 'zero'
                        const mes = await bot[index].telegram.sendMessage(process.env.TECH_CHAT, result.order + '\n\nГлобальный номер: ' + result.globalNumber, {...keyboardAdmin, parse_mode: 'HTML'}).catch(fix.errorDone)
                        const dataForUp = user.orders[user.orders.findIndex(item => item[0].globalNumber == Number(result.globalNumber))]
                        dataForUp[0].techMessage = mes.message_id
                        user.orders[user.orders.findIndex(item => item[0].globalNumber == Number(result.globalNumber))] = dataForUp
                        // console.log(user.orders[user.orders.findIndex(item => item[0].globalNumber == Number(result.globalNumber))][0].techMessage)
                    }
                    else if(value.split('|')[0] == 'varanti'){
                        // keyboard = Markup.inlineKeyboard([
                        //     Markup.button.callback(fix.textBack, `menu`)
                        // ])

                        const keyboardAdmin1 = Markup.inlineKeyboard([
                            Markup.button.callback('Принять заявку', `varantiManager|${Number(value.split('|')[1])}|${Number(value.split('|')[2])}`)
                        ])

                        await bot[index].telegram.sendMessage(process.env.TECH_CHAT, 'Запрос гарантии: #' + Number(value.split('|')[1]), {...keyboardAdmin1, parse_mode: 'HTML'}).catch(fix.errorDone)

                        const dataForUp = user.ordersArhiv[user.ordersArhiv.findIndex(item => item[0].globalNumber == Number(value.split('|')[1]))]
                        dataForUp[0].status.push(fix.statusOrder.status_9 + ' / ' + dateAndTime())
                        user.ordersArhiv[user.ordersArhiv.findIndex(item => item[0].globalNumber == Number(value.split('|')[1]))] = dataForUp

                        const keyboardAdmin = [
                            [{text: 'Запрос гарантии обработан', callback_data: `varantiDone|${Number(value.split('|')[1])}|${Number(value.split('|')[2])}`}],
                            [{text: '✅Обработка', callback_data: `zero`}, {text: '✅Отправлен', callback_data: `zero`}, {text: '✅Прибыл', callback_data: `zero`}],
                            [{text: '✅Получен', callback_data: `zero`}]
                        ]

                        await bot[index].telegram.editMessageReplyMarkup(process.env.TECH_CHAT, dataForUp[0].techMessage, 'q', {inline_keyboard: keyboardAdmin}).catch(fix.errorDone)

                        text = lobbiText + '\n\nМы скоро свяжемся с вами!'
                        keyboard = await meinMenuDisplay(user)
                        user.currentStatus = 'Menu'
                    }
                    else if(value.split('|')[0] == 'myOrders'){
                        user.orderIndex = value.split('|')[1] ? user.orders.findIndex(item => item[0].globalNumber == Number(value.split('|')[1])) : 0
                        const result = await orderMenu(user)
                        keyboard = result.keyboard
                        text = result.text
                        user.currentStatus = 'zero'
                    }
                    else if(value.split('|')[0] == 'myArhiv'){
                        user.orderIndex = value.split('|')[1] ? user.ordersArhiv.findIndex(item => item[0].globalNumber == Number(value.split('|')[1])) : 0
                        const result = await arhivMenu(user)
                        keyboard = result.keyboard
                        text = result.text
                        user.currentStatus = 'zero'
                    }
                    else if(value == 'nextArhivItem' || value == 'prevArhivItem'){
                        if(value == 'nextArhivItem'){
                            user.orderIndex++
                        }
                        else{
                            user.orderIndex--
                        }
                        const result = await arhivMenu(user)
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
                        text = lobbiText
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

                    await bot[index].telegram.editMessageText(ctx.from.id, user.lastMes, 'q', text, {...keyboard, parse_mode: 'HTML'}).catch(fix.errorDone)
                    await user.save()
                }
                else{
                    if(value.split('|')[0] == 'proccesOrder'){
                        const userClient = await User.findOne({id: Number(value.split('|')[1])})
                        const dataUp = userClient.orders[userClient.orders.findIndex(item => item[0].globalNumber == Number(value.split('|')[2]))]
                        dataUp[0].status.push(fix.statusOrder.status_2 + ' / ' + dateAndTime())
                        userClient.orders[userClient.orders.findIndex(item => item[0].globalNumber == Number(value.split('|')[2]))] = dataUp
                        const keyboardAdmin = [
                            [Markup.button.callback('Отменен поставщиком', `cancelByShop|${Number(value.split('|')[1])}|${Number(value.split('|')[2])}`), Markup.button.callback('Отменен заказчиком', `cancelByClient|${Number(value.split('|')[1])}|${Number(value.split('|')[2])}`)],
                            [{text: '✅Обработка', callback_data: `zero`}, {text: 'Отправлен', callback_data: `sendOrder|${Number(value.split('|')[1])}|${Number(value.split('|')[2])}`}]
                        ]
                        await ctx.editMessageReplyMarkup({inline_keyboard: keyboardAdmin}).catch(fix.errorDone)

                        const keyboard_1 = Markup.inlineKeyboard([
                            Markup.button.callback(fix.look, `myOrders|${Number(value.split('|')[2])}`)
                        ])

                        await bot[index].telegram.editMessageText(userClient.id, userClient.lastMes, Number(value.split('|')[2]), `Статус заказа #${value.split('|')[2]} изменился на:\n"${fix.statusOrder.status_2}" ✅`, {...keyboard_1}).catch(fix.errorDone)
                        await userClient.save()
                    }
                    else if(value.split('|')[0] == 'sendOrder'){
                        const userClient = await User.findOne({id: Number(value.split('|')[1])})
                        const dataUp = userClient.orders[userClient.orders.findIndex(item => item[0].globalNumber == Number(value.split('|')[2]))]
                        dataUp[0].status.push(fix.statusOrder.status_3 + ' / ' + dateAndTime())
                        userClient.orders[userClient.orders.findIndex(item => item[0].globalNumber == Number(value.split('|')[2]))] = dataUp
                        const keyboardAdmin = [
                            [Markup.button.callback('Отменен поставщиком', `cancelByShop|${Number(value.split('|')[1])}|${Number(value.split('|')[2])}`), Markup.button.callback('Отменен заказчиком', `cancelByClient|${Number(value.split('|')[1])}|${Number(value.split('|')[2])}`)],
                            [{text: '✅Обработка', callback_data: `zero`}, {text: '✅Отправлен', callback_data: `zero`}, {text: 'Прибыл', callback_data: `arrive|${Number(value.split('|')[1])}|${Number(value.split('|')[2])}`}]
                        ]
                        await ctx.editMessageReplyMarkup({inline_keyboard: keyboardAdmin}).catch(fix.errorDone)

                        const keyboard_1 = Markup.inlineKeyboard([
                            Markup.button.callback(fix.look, `myOrders|${Number(value.split('|')[2])}`)
                        ])

                        await bot[index].telegram.editMessageText(userClient.id, userClient.lastMes, Number(value.split('|')[2]), `Статус заказа #${value.split('|')[2]} изменился на:\n"${fix.statusOrder.status_3}" ✅`, {...keyboard_1}).catch(fix.errorDone)
                        await userClient.save()
                    }
                    else if(value.split('|')[0] == 'arrive'){
                        const userClient = await User.findOne({id: Number(value.split('|')[1])})
                        const dataUp = userClient.orders[userClient.orders.findIndex(item => item[0].globalNumber == Number(value.split('|')[2]))]
                        dataUp[0].status.push(fix.statusOrder.status_4 + ' / ' + dateAndTime())
                        userClient.orders[userClient.orders.findIndex(item => item[0].globalNumber == Number(value.split('|')[2]))] = dataUp
                        const keyboardAdmin = [
                            [Markup.button.callback('Отменен поставщиком', `cancelByShop|${Number(value.split('|')[1])}|${Number(value.split('|')[2])}`), Markup.button.callback('Отменен заказчиком', `cancelByClient|${Number(value.split('|')[1])}|${Number(value.split('|')[2])}`)],
                            [{text: '✅Обработка', callback_data: `zero`}, {text: '✅Отправлен', callback_data: `zero`}, {text: '✅Прибыл', callback_data: `zero`}],
                            [{text: 'Получен', callback_data: `recivedByClient|${Number(value.split('|')[1])}|${Number(value.split('|')[2])}`}, {text: 'Забили хуй', callback_data: `notRecivedByClient|${Number(value.split('|')[1])}|${Number(value.split('|')[2])}`}]
                        ]
                        await ctx.editMessageReplyMarkup({inline_keyboard: keyboardAdmin}).catch(fix.errorDone)

                        const keyboard_1 = Markup.inlineKeyboard([
                            Markup.button.callback(fix.look, `myOrders|${Number(value.split('|')[2])}`)
                        ])

                        await bot[index].telegram.editMessageText(userClient.id, userClient.lastMes, Number(value.split('|')[2]), `Статус заказа #${value.split('|')[2]} изменился на:\n"${fix.statusOrder.status_4}" ✅`, {...keyboard_1}).catch(fix.errorDone)
                        await userClient.save()
                    }
                    else if(value.split('|')[0] == 'recivedByClient'){
                        const userClient = await User.findOne({id: Number(value.split('|')[1])})
                        const index = userClient.orders.findIndex(item => item[0].globalNumber == Number(value.split('|')[2]))
                        const dataUp = userClient.orders[index]
                        dataUp[0].status.push(fix.statusOrder.status_5 + ' / ' + dateAndTime())
                        userClient.ordersArhiv.push(dataUp)
                        userClient.orders.splice(index, 1)


                        const keyboardAdmin = [
                            [{text: '✅Обработка', callback_data: `zero`}, {text: '✅Отправлен', callback_data: `zero`}, {text: '✅Прибыл', callback_data: `zero`}],
                            [{text: '✅Получен', callback_data: `zero`}]
                        ]
                        await ctx.editMessageReplyMarkup({inline_keyboard: keyboardAdmin}).catch(fix.errorDone)

                        const keyboard_1 = Markup.inlineKeyboard([
                            Markup.button.callback(fix.look, `myArhiv|${Number(value.split('|')[2])}`)
                        ])

                        await bot[index].telegram.editMessageText(userClient.id, userClient.lastMes, Number(value.split('|')[2]), `Статус заказа #${value.split('|')[2]} изменился на:\n"${fix.statusOrder.status_5}"`, {...keyboard_1}).catch(fix.errorDone)
                        await userClient.save()
                    }
                    else if(value.split('|')[0] == 'notRecivedByClient'){
                        const userClient = await User.findOne({id: Number(value.split('|')[1])})
                        const index = userClient.orders.findIndex(item => item[0].globalNumber == Number(value.split('|')[2]))
                        const dataUp = userClient.orders[index]
                        dataUp[0].status.push(fix.statusOrder.status_6 + ' / ' + dateAndTime())
                        userClient.ordersArhiv.push(dataUp)
                        userClient.orders.splice(index, 1)


                        const keyboardAdmin = [
                            [{text: '✅Обработка', callback_data: `zero`}, {text: '✅Отправлен', callback_data: `zero`}, {text: '✅Прибыл', callback_data: `zero`}],
                            [{text: '❌Забит хуй', callback_data: `zero`}]
                        ]
                        await ctx.editMessageReplyMarkup({inline_keyboard: keyboardAdmin}).catch(fix.errorDone)

                        const keyboard_1 = Markup.inlineKeyboard([
                            Markup.button.callback(fix.look, `myArhiv|${Number(value.split('|')[2])}`)
                        ])

                        await bot[index].telegram.editMessageText(userClient.id, userClient.lastMes, Number(value.split('|')[2]), `Статус заказа #${value.split('|')[2]} изменился на:\n"${fix.statusOrder.status_6}"`, {...keyboard_1}).catch(fix.errorDone)
                        await userClient.save()
                    }
                    else if(value.split('|')[0] == 'cancelByShop'){
                        const userClient = await User.findOne({id: Number(value.split('|')[1])})
                        const index = userClient.orders.findIndex(item => item[0].globalNumber == Number(value.split('|')[2]))
                        const dataUp = userClient.orders[index]
                        dataUp[0].status.push(fix.statusOrder.status_7 + ' / ' + dateAndTime())
                        userClient.ordersArhiv.push(dataUp)
                        userClient.orders.splice(index, 1)


                        const keyboardAdmin = [
                            [{text: fix.statusOrder.status_7, callback_data: `zero`}]
                        ]
                        await ctx.editMessageReplyMarkup({inline_keyboard: keyboardAdmin}).catch(fix.errorDone)

                        const keyboard_1 = Markup.inlineKeyboard([
                            Markup.button.callback(fix.look, `myArhiv|${Number(value.split('|')[2])}`)
                        ])

                        await bot[index].telegram.editMessageText(userClient.id, userClient.lastMes, Number(value.split('|')[2]), `Статус заказа #${value.split('|')[2]} изменился на:\n"${fix.statusOrder.status_7}"`, {...keyboard_1}).catch(fix.errorDone)
                        await userClient.save()
                    }
                    else if(value.split('|')[0] == 'cancelByClient'){
                        const userClient = await User.findOne({id: Number(value.split('|')[1])})
                        const index = userClient.orders.findIndex(item => item[0].globalNumber == Number(value.split('|')[2]))
                        const dataUp = userClient.orders[index]
                        dataUp[0].status.push(fix.statusOrder.status_8 + ' / ' + dateAndTime())
                        userClient.ordersArhiv.push(dataUp)
                        userClient.orders.splice(index, 1)


                        const keyboardAdmin = [
                            [{text: fix.statusOrder.status_8, callback_data: `zero`}]
                        ]
                        await ctx.editMessageReplyMarkup({inline_keyboard: keyboardAdmin}).catch(fix.errorDone)

                        const keyboard_1 = Markup.inlineKeyboard([
                            Markup.button.callback(fix.look, `myArhiv|${Number(value.split('|')[2])}`)
                        ])

                        await bot[index].telegram.editMessageText(userClient.id, userClient.lastMes, Number(value.split('|')[2]), `Статус заказа #${value.split('|')[2]} изменился на:\n"${fix.statusOrder.status_8}"`, {...keyboard_1}).catch(fix.errorDone)
                        await userClient.save()
                    }
                }
            }
            catch(e){
                console.log('callback_query\n' + e)
            }
            
        })

        bot[index].launch(option)
        process.once('SIGINT', () => bot[index].stop('SIGINT'))
        process.once('SIGTERM', () => bot[index].stop('SIGTERM'))
    }
   
}

start()