import { Markup } from "telegraf"
import { fix } from "../fixConst.js"
import { perenos } from "./perenos.js"

const funBut = async (item, count, name) => {

    if(item == 0 && name == '⬅️'){
        return Markup.button.callback(name, `cart`, 'hide')
    }
    else if(count - 1 == item && name == '➡️'){
        return Markup.button.callback(name, `cart`, 'hide')
    }

    if(name == '➡️'){
        return Markup.button.callback(name, `nextOrderItem`) 
    }
    else{
        return Markup.button.callback(name, `prevOrderItem`) 
    }
}

const canCancel = async (status, index) => {
    if(status.split('/')[0] == 'Создан'){
        return Markup.button.callback('Отменить', `cancelOrder|${index}`)  
    }
    return Markup.button.callback('Отменить', `canselOrder`, 'hide')
}

export const orderMenu = async (user) => {
    let keyboard
    let text

    const order = user.orders

    if(user.orders.length !== 0){
        
        keyboard = Markup.inlineKeyboard([
            [await canCancel(user.orders[user.orderIndex][0].status[user.orders[user.orderIndex][0].status.length - 1], user.orderIndex), Markup.button.callback('Заказать звонок', `ring|${user.orderIndex}|${user.id}`)],
            [await funBut(user.orderIndex, order.length, '⬅️'), Markup.button.callback('Назад', `menu`), await funBut(user.orderIndex, order.length, '➡️')]
        ])

        const summa = async () => {
            return await user.orders[user.orderIndex].reduce(function(a, b){return a + (b.price * b.inch)}, 0)
        }

        const summaTovar = async () => {
            return await user.orders[user.orderIndex].map(item => item.inch).reduce(function(a, b){return a + b}, 0)
        }

        let devises = `<b>Заказ #${user.orderIndex + 1}</b>\n${user.orders[user.orderIndex][0].shipping}`

        for(let i of user.orders[user.orderIndex]){
            devises = devises + `\n\n▪️${await perenos(i.name)}\n▫️Количество: ${i.inch}\n▫️Стоимость: ${i.price} руб за шт\n▫️Итого: ${i.price * i.inch} руб`
        }

        console.log(user.orders[user.orderIndex][0].status)

        text = `${devises}\n\n${user.orders[user.orderIndex][0].time}\n<b>Всего товаров:</b> ${await summaTovar()} шт\n<b>Сумма заказа:</b> ${await summa()} руб\n<b>Статус заказа:</b>\n- ${user.orders[user.orderIndex][0].status.join('\n- ')}`
    }
    else{
        keyboard = Markup.inlineKeyboard([Markup.button.callback(fix.menu, `menu`)])
        text = 'Активных заказов нет'
    }

    return {'keyboard': keyboard, 'text': text}
}