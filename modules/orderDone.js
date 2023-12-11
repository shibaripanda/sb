import { Markup } from "telegraf"
import { Accum } from "./models/Accum.js"
import { User } from "./models/User.js"
import { fix } from "./fixConst.js"
import { dateAndTime } from "./dateTime.js"
import { orderMenu } from "./menuModules/menuOrder.js"
import { Data } from "./models/Data.js"

export const orderDone = async (user) => {
    try{
        let keyboard
        let text
        
        let orderDetails
        const orderActiv = []
        
        if(user.orderHot.split('|')[1] == 'cart'){
            for(let i of user.cart){
                const device = await Accum.findOne({_id: i.origId})
                if(device){
                    orderActiv.push({
                        name: device.model,
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
                orderActiv.push({
                    name: device.model,
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
            keyboard = Markup.inlineKeyboard([
                [Markup.button.callback('Корзина', `cart`)],
                [Markup.button.callback('Меню', `menu`)]
            ])
        }
        else{
            await Data.updateOne({data: 'data'}, {$inc: {globalNumber: 1, countOrders: 1}}, {upsert: true})
            orderActiv[0].globalNumber = (await Data.findOne({data: 'data'}, {globalNumber: 1, _id: 0})).globalNumber
            orderActiv[0].time = dateAndTime()
            orderActiv[0].status = [fix.statusOrder.status_1 + ' / ' + dateAndTime()]
            orderActiv[0].shipping = 'Данные для отправки:\n' +
                                    user.surname[user.surname.length - 1] + '\n' +
                                    user.name[user.name.length - 1] + '\n' +
                                    user.lastname[user.lastname.length - 1] + '\n' +
                                    user.tel[user.tel.length - 1] + '\n' +
                                    user.email[user.email.length - 1] + '\nОтделение Европочты № ' + 
                                    user.evropochta[user.evropochta.length - 1]
            user.orders.push(orderActiv)


            for(let i of user.orders.filter(item => item[0].globalNumber == orderActiv[0].globalNumber)[0]){
                user.cart.splice(user.cart.findIndex(item => item.origId == i.origId), 1)
            }
            await User.updateOne({id: user.id}, {cart: user.cart})

            const summa = async () => {
                return await user.orders.reduce(async function(a, b){
                    return await a + b.reduce(function(x, y){
                        return x + (y.price * y.inch)
                    }, 0)
                }, 0)
            }

            const cart = async (user) => {
                if(user.cart.length > 0){
                    const summa = async () => {
                        return await user.cart.reduce(function(a, b){return a + (b.price * b.inch)}, 0)
                    }
                    const summaTovar = async () => {
                        return await user.cart.map(item => item.inch).reduce(function(a, b){return a + b}, 0)
                    }
                    return Markup.button.callback(fix.сart + ` (${await summaTovar()} шт, ${(await summa()).toFixed(2)} ${fix.valut})`, `cart`)
                }
                return Markup.button.callback(`but`, `cart`, 'hide')
            }

            text = `Заказ #${orderActiv[0].globalNumber} создан!`
            keyboard = Markup.inlineKeyboard([
                [Markup.button.callback('Отменить', `cancelOrder|${user.orders.length - 1}`)],
                [Markup.button.callback('Заказы' + ` (${user.orders.length} шт, ${(await summa()).toFixed(2)} ${fix.valut})`, `myOrders`)],
                [await cart(user)],
                [Markup.button.callback('Меню', `menu`)]
            ])
        }
        user.orderIndex = user.orders.length - 1
        return {'keyboard': keyboard, 'text': text, 'order': (await orderMenu(user)).text, 'globalNumber': orderActiv[0].globalNumber, 'user': user.id}
        
        }
        catch(e){
            console.log('orderDone ' + e)
        }
    
}