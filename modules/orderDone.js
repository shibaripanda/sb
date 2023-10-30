import { Markup } from "telegraf"
import { Accum } from "../models/Accum.js"
import { User } from "../models/User.js"

export const orderDone = async (user, ctx) => {
    let keyboard
    let text
    
    let orderDetails
    const orderActiv = []
    
    if(user.orderHot.split('|')[1] == 'cart'){
        for(let i of user.cart){
            const device = await Accum.findOne({_id: i.origId})
            if(device){
                orderActiv.push({
                    origId: String(device._id),
                    price: device.price,
                    inch: i.inch,
                    shipping: user.surname[user.surname.length - 1] + '\n' +
                                user.name[user.name.length - 1] + '\n' +
                                user.lastname[user.lastname.length - 1] + '\n' +
                                user.tel[user.tel.length - 1] + '\n' +
                                user.email[user.email.length - 1] + '\n' + 
                                user.evropochta[user.evropochta.length - 1]
                })
                orderDetails = true
            }
            else{
                user.orders = []
                orderDetails = false
                break
            }
        }
    }
    else{
        const device = await Accum.findOne({_id: user.orderHot.split('|')[1]})
        if(device){
            orderActiv.push({
                origId: String(device._id),
                price: device.price,
                inch: Number(user.orderHot.split('|')[2]),
                shipping: user.surname[user.surname.length - 1] + '\n' +
                        user.name[user.name.length - 1] + '\n' +
                        user.lastname[user.lastname.length - 1] + '\n' +
                        user.tel[user.tel.length - 1] + '\n' +
                        user.email[user.email.length - 1] + '\n' + 
                        user.evropochta[user.evropochta.length - 1]
            })
            orderDetails = true 
        }
        else{
            user.orders = []
            orderDetails = false
        }
    }
    
    if(orderDetails == false){
        text = 'ошибка'
        keyboard = Markup.inlineKeyboard([
            [Markup.button.callback('Корзина', `cart`)],
            [Markup.button.callback('Меню', `menu`)]
        ])
    }
    else{
        const numberOrder = Date.now()
        orderActiv.order = numberOrder
        user.orders.push(orderActiv)

        console.log(user.orders.filter(item => item.order == numberOrder)[0])

        for(let i of user.orders.filter(item => item.order == numberOrder)[0]){
            user.cart.splice(user.cart.findIndex(item => item.origId == i.origId), 1)
        }
        await User.updateOne({id: ctx.from.id}, {cart: user.cart})

        

        text = 'Заказ создан!'
        keyboard = Markup.inlineKeyboard([
            [Markup.button.callback('Отменить', `cancelOrder|${numberOrder}`)],
            [Markup.button.callback('Меню', `menu`)]
        ])
    }

    return {'keyboard': keyboard, 'text': text}
}