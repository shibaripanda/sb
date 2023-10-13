import { Markup } from "telegraf"
import { fix } from "../fixConst.js"
import { Accum } from "../models/Accum.js"

const funBut = async (item, count, name) => {

    if(item == 0 && name == 'Назад'){
        return Markup.button.callback(name, `cart`, 'hide')
    }
    else if(count - 1 == item && name == 'Следующий'){
        return Markup.button.callback(name, `cart`, 'hide')
    }

    if(name == 'Следующий'){
        return Markup.button.callback(name, `nextCartItem`) 
    }
    else{
        return Markup.button.callback(name, `prevCartItem`) 
    }
}

export const pageCartKeyboardAndText = async (user) => {
    let keyboard
    let text

    const newAr = user.cart.slice(0)
    user.cart = []
    for(let i of newAr){
        const curItem = await Accum.findOne({_id: i.item})
        if(curItem){
            user.cart.push({item: curItem._id, price: curItem.price, orig: curItem})
        }
    }
    if(user.cart.length !== 0){    
        keyboard = Markup.inlineKeyboard([
            [await funBut(user.cartIndex, user.cart.length, 'Назад'), Markup.button.callback(fix.order, `order|${user.cart[user.cartIndex]._id}|${user.cart[user.cartIndex].price}`), await funBut(user.cartIndex, user.cart.length, 'Следующий')],
            [Markup.button.callback('Удалить', `deleteFromCart|${user.cart[user.cartIndex]._id}`)],
            [Markup.button.callback('Оформить всё', 'orderCartAll')],
            [Markup.button.callback('Удалить всё', 'deleteCartAll')],
            [Markup.button.callback(fix.menu, `menu`)]
        ])

        const summa = async () => {
        return await user.cart.map(item => item.price).reduce(function(a, b){return a + b}, 0)
        }

        text = `В корзине ${user.cart.length} товаров \nCумма ${await summa()} бел.руб.\n\n# ${user.cartIndex + 1}\n` + user.cart[user.cartIndex].orig.model + '\n' + user.cart[user.cartIndex].orig.price
    }
    else{
        keyboard = Markup.inlineKeyboard([Markup.button.callback(fix.menu, `menu`)])
        text = fix.emptyCart
    }

    return {'keyboard': keyboard, 'text': text}
}