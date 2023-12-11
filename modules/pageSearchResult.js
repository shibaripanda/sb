import { fix } from "./fixConst.js"
import { Markup } from "telegraf"
import { perenos } from "./perenos.js"
import { Accum } from "./models/Accum.js"

const funBut = async (item, count, name) => {

    if(item == 0 && name == '⬅️'){
        return Markup.button.callback(name, `cart`, 'hide')
    }
    else if(count - 1 == item && name == '➡️'){
        return Markup.button.callback(name, `cart`, 'hide')
    }

    if(name == '➡️'){
        return Markup.button.callback(name, `nextSearchResult`) 
    }
    else{
        return Markup.button.callback(name, `prevSearchResult`) 
    }
   
}

const cartBut = async (lengthCart, count) => {
    if(lengthCart == 0){
        return Markup.button.callback(fix.сart, `cart`, 'hide')
    }
    return Markup.button.callback(fix.сart + ` (${count})`, `cart`)
}

export const pageSearchResultKeyboardAndText = async (user) => {
    let keyboard
    let text
    if(user.bufferSearch.item.length !== 0){
        const item = await Accum.findOne({_id: user.bufferSearch.item[user.bufferSearch.step]})

        const summaTovar = async () => {
            return await user.cart.map(item1 => item1.inch).reduce(function(a, b){return a + b}, 0)
        }

        keyboard = Markup.inlineKeyboard([
            [await funBut(user.bufferSearch.step, user.bufferSearch.len, '⬅️'), Markup.button.callback(fix.inCart,  `inCart|${String(item._id)}|${item.price}`), await funBut(user.bufferSearch.step, user.bufferSearch.len, '➡️')],
            [await cartBut(user.cart.length, await summaTovar()), Markup.button.callback(fix.menu, `menu`)]
        ])

        let cartInbox = ''
        const inbox = user.cart.find(item1 => item1.origId == String(item._id))
        if(inbox){
            if(inbox.inch == 1){
                cartInbox = `(Уже в корзине)`
            }
            else{
                cartInbox = `(Уже в корзине ${inbox.inch} шт)`
            }       
        }
        
        text = await perenos(item.model) + '\n' + item.price + ' '+ fix.valut + '\n' + cartInbox
    }
    else{
        keyboard = Markup.inlineKeyboard([Markup.button.callback(fix.textBack, `menu`)])
        text = fix.textNoResult
    }
    return {'keyboard': keyboard, 'text': text}
}