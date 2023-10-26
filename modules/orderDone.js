import { Markup } from "telegraf"
import { Accum } from "../models/Accum.js"
import { User } from "../models/User.js"

export const orderDone = async (user, ctx) => {
    let keyboard
    let text
    
    let orderDetails
    if(user.orderHot.split('|')[1] == 'cart'){
        for(let i of user.cart){
            const device = await Accum.findOne({_id: i.origId})
            if(device){
                user.orders.push({
                    origId: String(device._id),
                    price: device.price,
                    inch: i.inch
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
            user.orders.push({
                origId: String(device._id),
                price: device.price,
                inch: Number(user.orderHot.split('|')[2])
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
    }
    else{
        for(let i of user.orders){
            user.cart.splice(user.cart.findIndex(item => item.origId == i.origId), 1)
        }
        await User.updateOne({id: ctx.from.id}, {cart: user.cart})
        text = 'Заказ создан!'
    }
    

    keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('Отменить', `cancelOrder`)],
        [Markup.button.callback('Меню', `menu`)]
    ])

    return {'keyboard': keyboard, 'text': text}
}