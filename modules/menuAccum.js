import { Markup } from "telegraf"
import { fix } from "../fixConst.js"

export const keyboardAccum = async (user, value) => {
    try{
        const keyboardArray = []

        for(let i of fix.modelsDevicesTel){
            keyboardArray.push([Markup.button.callback(i.name, `${i.text}|${value}`)])
        }
    
        if(user.cart.length > 0){

            const summa = async () => {
                return await user.cart.reduce(function(a, b){return a + (b.price * b.inch)}, 0)
             }
 
             const summaTovar = async () => {
                 return await user.cart.map(item => item.inch).reduce(function(a, b){return a + b}, 0)
             }



            keyboardArray.push([Markup.button.callback(fix.сart + ` (${await summaTovar()} шт, ${await summa()} руб)`, `cart`)])     
        }
        keyboardArray.push([Markup.button.callback(fix.menu, `menu`)])

        return Markup.inlineKeyboard(keyboardArray)
    }   
    catch(e){
        console.log('keyboardAccum\n' + e)
    }
}