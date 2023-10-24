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

    keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('Имя', `menu`)],
        [Markup.button.callback('Фамилия', `menu`)],
        [Markup.button.callback('Отчество', `menu`)],
        [Markup.button.callback('Телефон', `menu`)],
        [Markup.button.callback('email', `menu`)],
        [Markup.button.callback('Европочта №', `menu`)],
        [Markup.button.callback(fix.menu, `menu`)]
    ])
        
    text = `Информация для отправки заказа\n\n${user.name}\n${user.surname}\n${user.lastname}\n${user.tel}\n${user.email}\n${user.evropochta}`
    

    return {'keyboard': keyboard, 'text': text}
}