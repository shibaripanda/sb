import { fix } from "../fixConst.js"
import { Markup } from "telegraf"

const funBut = async (item, count, name) => {

    if(item == 0 && name == 'Назад'){
        return Markup.button.callback(name, `cart`, 'hide')
    }
    else if(count - 1 == item && name == 'Следующий'){
        return Markup.button.callback(name, `cart`, 'hide')
    }

    if(name == 'Следующий'){
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
        const item = user.bufferSearch.item[user.bufferSearch.step]
        const item2 = user.bufferSearch
            keyboard = Markup.inlineKeyboard([
                [await funBut(item2.step, item2.len, 'Назад'), Markup.button.callback(fix.inCart,  `inCart|${item._id}|${item.price}`), await funBut(item2.step, item2.len, 'Следующий')],
                [await cartBut(user.cart.length, user.cart.length), Markup.button.callback(fix.menu, `menu`)]
            ]) 
        text = item.model + '\n' + item.price
    }
    else{
        keyboard = Markup.inlineKeyboard([Markup.button.callback(fix.textBack, `menu`)])
        text = fix.textNoResult
    }
    return {'keyboard': keyboard, 'text': text}
}