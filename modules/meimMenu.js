import { Markup } from "telegraf"
import { fix } from "../fixConst.js"

export const meinMenuDisplay = (user) => {
    try{
        const keyboardArray = []

        for(let i of fix.mainMenuButtons){
            keyboardArray.push([Markup.button.callback(i.name, i.text)])
        }
    
        if(user.cart.length > 0){
            keyboardArray.push([Markup.button.callback(fix.сart + ` (${user.cart.length})`, `cart`)])     
        }

        return Markup.inlineKeyboard(keyboardArray)
    }   
    catch(e){
        console.log('meinMenuDisplay\n' + e)
    }
}