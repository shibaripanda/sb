import { Markup } from "telegraf"
import { fix } from "../fixConst.js"
import { perenos } from "../perenos.js"

const funBut = async (item, count, name) => {

    if(item == 0 && name == '⬅️'){
        return Markup.button.callback(name, `cart`, 'hide')
    }
    else if(count - 1 == item && name == '➡️'){
        return Markup.button.callback(name, `cart`, 'hide')
    }

    if(name == '➡️'){
        return Markup.button.callback(name, `nextArhivItem`) 
    }
    else{
        return Markup.button.callback(name, `prevArhivItem`) 
    }
}

const varanti = async (status) => {
    if(status[status.length - 1].indexOf('❌') !== -1 || status[status.length - 1].indexOf('♻️') !== -1){
        return 'hide'
    }
    return false
}

export const arhivMenu = async (user) => {
    let keyboard
    let text

    const order = user.ordersArhiv

    if(user.ordersArhiv.length !== 0){
        
        keyboard = Markup.inlineKeyboard([
            [Markup.button.callback('Гарантия (заказать звонок)', `varanti|${user.ordersArhiv[user.orderIndex][0].globalNumber}|${user.id}`, await varanti(user.ordersArhiv[user.orderIndex][0].status))],
            [await funBut(user.orderIndex, order.length, '⬅️'), Markup.button.callback(fix.menu, `menu`), await funBut(user.orderIndex, order.length, '➡️')]
        ])

        const summa = async () => {
            return await user.ordersArhiv[user.orderIndex].reduce(function(a, b){return a + (b.price * b.inch)}, 0)
        }

        const summaTovar = async () => {
            return await user.ordersArhiv[user.orderIndex].map(item => item.inch).reduce(function(a, b){return a + b}, 0)
        }

        let devises = `<b>Архивный заказ #${user.ordersArhiv[user.orderIndex][0].globalNumber}</b>\n${user.ordersArhiv[user.orderIndex][0].shipping}`

        for(let i of user.ordersArhiv[user.orderIndex]){
            devises = devises + `\n\n▪️${await perenos(i.name)}\n▫️Количество: ${i.inch}\n▫️Стоимость: ${i.price} ${fix.valut} за шт\n▫️Итого: ${i.price * i.inch} ${fix.valut}`
        }

        text = `${devises}\n\n${user.ordersArhiv[user.orderIndex][0].time}\n<b>Всего товаров:</b> ${await summaTovar()} шт\n<b>Сумма заказа:</b> ${(await summa()).toFixed(2)} ${fix.valut}\n\n<b>Статус заказа:</b>\n- ${user.ordersArhiv[user.orderIndex][0].status.join('\n- ')}`
    }
    else{
        keyboard = Markup.inlineKeyboard([Markup.button.callback(fix.menu, `menu`)])
        text = 'Архив пуст'
    }

    return {'keyboard': keyboard, 'text': text}
}