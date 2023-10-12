import { Markup } from "telegraf"
import { fix } from "../fixConst.js"

export const keyboardAccum = (user, value) => {
    try{
        const keyboardArray = []

        for(let i of fix.modelsDevicesTel){
            keyboardArray.push([Markup.button.callback(i.name, `${i.text}|${value}`)])
        }
    
        if(user.cart.length > 0){
            keyboardArray.push([Markup.button.callback('Корзина', `cart`)])     
        }
        keyboardArray.push([Markup.button.callback('Меню', `menu`)])

        return Markup.inlineKeyboard(keyboardArray)
    }   
    catch(e){
        console.log('keyboardAccum\n' + e)
    }
}