import { Markup } from "telegraf"
import { Accum } from "./models/Accum.js"
import { perenos } from "./perenos.js"
import { fix } from "./fixConst.js"

// const funBut = async (item, count, name) => {

//     if(item == 0 && name == '⬅️'){
//         return Markup.button.callback(name, `cart`, 'hide')
//     }
//     else if(count - 1 == item && name == '➡️'){
//         return Markup.button.callback(name, `cart`, 'hide')
//     }

//     if(name == '➡️'){
//         return Markup.button.callback(name, `nextCartItem`) 
//     }
//     else{
//         return Markup.button.callback(name, `prevCartItem`) 
//     }
// }

// async function oneOrMore(count){
//     if(count == 1){
//         return 'Удалить'
//     }
//     return 'Удалить 1'
// }

// const funButOrderCart = async (count) => {

//     if(count == 1){
//         return Markup.button.callback('Оформить всю корзину', 'orderCartAll', 'hide')
//     }
//     else{
//         return Markup.button.callback('Оформить всю корзину', 'orderCartAll')
//     }
// }

// const funButCleanCart = async (count) => {

//     if(count == 1){
//         return Markup.button.callback('Удалить всю корзину', 'deleteCartAll', 'hide')
//     }
//     else{
//         return Markup.button.callback('Удалить всю корзину', 'deleteCartAll')
//     }
// }

export const userInfo = async (user) => {
    let keyboard
    let text
    // await updateCart(user)
    let step = 0
    let haveOrder = true

    const flag = async (index) => {
        if(user[index].length == 1){
            return '❗️'
        }
        step++
        return '✅'
    }

    const readyOrder = async (step, haveOrder) => {
        if(step == 6 && haveOrder == true){
            return Markup.button.callback(`Заказать ✅`, `orderDone`)
        }
        return Markup.button.callback(`Заказать!`, `Продолжить`, 'hide')
    }

    let orderDetails
    if(user.orderHot.split('|')[1] == 'cart'){

        let listTovar = ' '
        let step = 1
        for(let i of user.cart){
            const device = await Accum.findOne({_id: i.origId})
            if(device){
                const sum = device.price * i.inch
                listTovar = listTovar + `\n<b>▪️#${step}</b>\n${await perenos(device.model)}\n<b>Количество:</b> ${i.inch} шт.\n<b>Сумма:</b> ${sum} ${fix.valut}\n`
                step++
            }
            else{
                haveOrder = false
                listTovar = 'В вашей корзине есть недоступные товары, вернитесь в корзину для обновления информации'
                break
            }
        }

        const summa = async () => {
            return await user.cart.reduce(function(a, b){return a + (b.price * b.inch)}, 0)
        }

        const summaTovar = async () => {
            return await user.cart.map(item => item.inch).reduce(function(a, b){return a + b}, 0)
        }

        orderDetails = listTovar + `\n<b>Итого:</b> ${await summaTovar()} шт на общую сумму ${await summa()} ${fix.valut}`
    }
    else{
        const device = await Accum.findOne({_id: user.orderHot.split('|')[1]})
        if(device){
           const sum = device.price * Number(user.orderHot.split('|')[2])
           orderDetails = `${await perenos(device.model)}\n<b>Количество:</b> ${user.orderHot.split('|')[2]} шт.\n<b>Сумма:</b> ${sum} ${fix.valut}` 
        }
        else{
            haveOrder = false
            orderDetails = 'Данный товар более не продается!, вернитесь в корзину для обновления информации' 
        }
    }

    const warning = async (step) => {
        if(step == 6){
            return 'Перед заказом <b>ВНИМАТЕЛЬНО</b> проверьте информацию выше!'
        }
        return 'Укажите всю необходимую информацию для заказа!'
    }
    
    text = `<b>Информация для отправки заказа</b>\n\n${await flag('surname')} ${user.surname[user.surname.length - 1]}\n${await flag('name')} ${user.name[user.name.length - 1]}\n${await flag('lastname')} ${user.lastname[user.lastname.length - 1]}\n\n${await flag('tel')} ${user.tel[user.tel.length - 1]}\n${await flag('email')} ${user.email[user.email.length - 1]}\n\n${await flag('evropochta')} № отделения Европочты: ${user.evropochta[user.evropochta.length - 1]}\n\n<b>Ваш заказ:</b>\n${orderDetails}\n\n${await warning(step)}`
    
    console.log('Длинна строки ' + text.length)

    keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('Ф', `surname`), Markup.button.callback('И', `name`), Markup.button.callback('О', `lastname`)],
        [Markup.button.callback('Телефон', `tel`), Markup.button.callback('email', `email`)],
        [Markup.button.callback('Европочта № отделения', `evropochta`)],
        [Markup.button.callback('Корзина', `cart`), await readyOrder(step, haveOrder)]
    ])

    return {'keyboard': keyboard, 'text': text}
}