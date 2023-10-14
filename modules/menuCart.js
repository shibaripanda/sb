import { Markup } from "telegraf"
import { fix } from "../fixConst.js"
import { Accum } from "../models/Accum.js"
import { perenos } from "./perenos.js"

const funBut = async (item, count, name) => {
    console.log(item + ' ' + count)

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

async function oneOrMore(count){
    if(count == 1){
        return 'Удалить'
    }
    return 'Удалить 1'
}

export const pageCartKeyboardAndText = async (user) => {
    let keyboard
    let text

    const newAr = user.cart.slice(0)
    user.cart = []
    for(let i of newAr){
        const curItem = await Accum.findOne({_id: i.item})
        if(curItem){
            user.cart.push({
                item: curItem._id,
                price: curItem.price,
                orig: curItem
            })
        }
    }
    // console.log(user.cart)
    user.cart = user.cart.sort((a,b) => {return a.orig.model.length - b.orig.model.length})
    // console.log(user.cart)

    if(user.cart.length !== 0){
        
        let cartInbox = ''
        const inbox = user.cart.filter(item1 => item1.orig.model == user.cart[user.cartIndex].orig.model)
        if(inbox.length == 1){
            cartInbox = ``
        }
        else if(inbox.length > 1){
            cartInbox = `(У вас в корзине ${inbox.length} таких товара)`
        }     
        
        keyboard = Markup.inlineKeyboard([
            [await funBut(user.cartIndex, user.cart.length, 'Назад'), Markup.button.callback(fix.order, `order|${user.cart[user.cartIndex]._id}|${user.cart[user.cartIndex].price}`), await funBut(user.cartIndex, user.cart.length, 'Следующий')],
            [Markup.button.callback(await oneOrMore(inbox.length), `deleteFromCart|${user.cart[user.cartIndex]._id}`), Markup.button.callback('Добавить', `inCartinCart|${user.cart[user.cartIndex].orig._id}|${user.cart[user.cartIndex].orig.price}` )],//`deleteFromCart|${user.cart[user.cartIndex]._id}`
            [Markup.button.callback('Оформить всю корзину', 'orderCartAll')],
            [Markup.button.callback('Удалить всю корзину', 'deleteCartAll')],
            [Markup.button.callback(fix.menu, `menu`)]
        ])

        const summa = async () => {
        return await user.cart.map(item => item.price).reduce(function(a, b){return a + b}, 0)
        }

           

        text = `В корзине ${user.cart.length} товаров \nCумма ${await summa()} бел.руб.\n\n# ${user.cartIndex + 1}\n` +  await perenos(user.cart[user.cartIndex].orig.model) + '\n' + user.cart[user.cartIndex].orig.price  + '\n' +  cartInbox
    }
    else{
        keyboard = Markup.inlineKeyboard([Markup.button.callback(fix.menu, `menu`)])
        text = fix.emptyCart
    }

    return {'keyboard': keyboard, 'text': text}
}