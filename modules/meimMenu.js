import { Markup } from "telegraf"
import { fix } from "../fixConst.js"

export const meinMenuDisplay = async (user) => {
    try{
        const keyboardArray = []

        for(let i of fix.mainMenuButtons){
            keyboardArray.push([Markup.button.callback(i.name, i.text)])
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

        if(user.orders.length > 0){

            console.log(user.orders)


            const summa = async () => {
                return await user.orders.reduce(async function(a, b){
                    return await a + b.reduce(function(x, y){
                        return x + (y.price * y.inch)
                    }, 0)
                }, 0)
            }

            keyboardArray.push([Markup.button.callback('Заказы' + ` (${user.orders.length} шт, ${await summa()} руб)`, `myOrders`)])     
        }

        return Markup.inlineKeyboard(keyboardArray)
    }   
    catch(e){
        console.log('meinMenuDisplay\n' + e)
    }
}