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

export const pageCartKeyboardAndText = async (user) => {
    let keyboard
    let text
    if(user.cart.length !== 0){
        const itemThis = await Accum.findOne({_id: user.cart[user.cartIndex].origId})

        keyboard = Markup.inlineKeyboard([
            [await funBut(user.cartIndex, user.cart.length, '⬅️'), Markup.button.callback(fix.order, `order|${user.cart[user.cartIndex].origId}|${user.cart[user.cartIndex].inch}`), await funBut(user.cartIndex, user.cart.length, '➡️')],
            [Markup.button.callback(await oneOrMore(user.cart[user.cartIndex].inch), `deleteFromCart|${user.cart[user.cartIndex].origId}`), Markup.button.callback('Добавить 1', `inCartinCart|${user.cart[user.cartIndex].origId}`)],
            [await funButOrderCart(user.cart.length)],
            [await funButCleanCart(user.cart.length)],
            [Markup.button.callback(fix.menu, `menu`)]
        ])

        const summa = async () => {
            return await user.cart.reduce(function(a, b){return a + (b.price * b.inch)}, 0)
        }

        const summaTovar = async () => {
            return await user.cart.map(item => item.inch).reduce(function(a, b){return a + b}, 0)
        }

           

        text = `В корзине ${await summaTovar()} товаров \nCумма ${await summa()} бел.руб.\n\n# ${user.cartIndex + 1} x ${user.cart[user.cartIndex].inch} шт\n\n` +  await perenos(itemThis.model) + '\n' + itemThis.price
    }
    else{
        keyboard = Markup.inlineKeyboard([Markup.button.callback(fix.menu, `menu`)])
        text = fix.emptyCart
    }

    return {'keyboard': keyboard, 'text': text}
}