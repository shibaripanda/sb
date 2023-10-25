import { Markup } from "telegraf"
import { fix } from "../fixConst.js"
import { Accum } from "../models/Accum.js"
import { perenos } from "./perenos.js"

const funBut = async (item, count, name) => {

    if(item == 0 && name == '⬅️'){
        return Markup.button.callback(name, `cart`, 'hide')
    }
    else if(count - 1 == item && name == '➡️'){
        return Markup.button.callback(name, `cart`, 'hide')
    }

    if(name == '➡️'){
        return Markup.button.callback(name, `nextCartItem`) 
    }
    else{
        return Markup.button.callback(name, `prevCartItem`) 
    }
}

async function oneOrMore(count){
    if(count == 1){
        return 'Удалить'
    }
    return 'Удалить 1'
}

const funButOrderCart = async (count) => {

    if(count == 1){
        return Markup.button.callback('Оформить всю корзину', 'orderCartAll', 'hide')
    }
    else{
        return Markup.button.callback('Оформить всю корзину', 'orderCartAll')
    }
}

const funButCleanCart = async (count) => {

    if(count == 1){
        return Markup.button.callback('Удалить всю корзину', 'deleteCartAll', 'hide')
    }
    else{
        return Markup.button.callback('Удалить всю корзину', 'deleteCartAll')
    }
}

export const userInfo = async (user) => {
    let keyboard
    let text

    let step = 0

    const flag = async (index) => {
        if(user[index].length == 1){
            return '❗️'
        }
        step++
        return '✅'
    }

    const readyOrder = async (step) => {
        if(step == 6){
            return Markup.button.callback(`Заказать!`, `Продолжить`)
        }
        return Markup.button.callback(`Заказать!`, `Продолжить`, 'hide')
    }

    let orderDetails
    if(user.orderHot.split('|')[1] == 'cart'){
        const summa = async () => {
            return await user.cart.reduce(function(a, b){return a + (b.price * b.inch)}, 0)
        }

        const summaTovar = async () => {
            return await user.cart.map(item => item.inch).reduce(function(a, b){return a + b}, 0)
        }

        orderDetails = `${await summaTovar()} шт на общую сумму ${await summa()} руб.`
    }
    else{
        const device = await Accum.findOne({_id: user.orderHot.split('|')[1]})
        const sum = device.price * Number(user.orderHot.split('|')[2])

        orderDetails = `${await perenos(device.model)}\n<b>Количество:</b> ${user.orderHot.split('|')[2]} шт.\n<b>Сумма:</b> ${sum} руб.`
    }

    const warning = async (step) => {
        if(step == 6){
            return 'Перед заказом <b>ВНИМАТЕЛЬНО</b> проверьте информацию выше!'
        }
        return 'Укажите всю необходимую информацию для заказа!'
    }
    
    text = `<b>Информация для отправки заказа</b>\n\n${await flag('surname')} ${user.surname[user.surname.length - 1]}\n${await flag('name')} ${user.name[user.name.length - 1]}\n${await flag('lastname')} ${user.lastname[user.lastname.length - 1]}\n\n${await flag('tel')} ${user.tel[user.tel.length - 1]}\n${await flag('email')} ${user.email[user.email.length - 1]}\n\n${await flag('evropochta')} № отделения Европочты: ${user.evropochta[user.evropochta.length - 1]}\n\n<b>Ваш заказ:</b>\n${orderDetails}\n\n${await warning(step)}`
    
    console.log(step)

    keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('Ф', `surname`), Markup.button.callback('И', `name`), Markup.button.callback('О', `lastname`)],
        [Markup.button.callback('Телефон', `tel`), Markup.button.callback('email', `email`)],
        [Markup.button.callback('Европочта № отделения', `evropochta`)],
        [Markup.button.callback(fix.textBack, `cart`), await readyOrder(step)]
    ])
        
    
    

    return {'keyboard': keyboard, 'text': text}
}