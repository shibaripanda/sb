import { Markup } from "telegraf"
import { fix } from "../fixConst.js"

export const meinMenuDisplay = async (user) => {
    try{
        const keyboardArray = []

        for(let i of fix.mainMenuButtons){
            keyboardArray.push(i)
        }
    
        if(user.cart.length > 0){

            const summa = async () => {
               return await user.cart.reduce(function(a, b){return a + (b.price * b.inch)}, 0)
            }

            const summaTovar = async () => {
                return await user.cart.map(item => item.inch).reduce(function(a, b){return a + b}, 0)
            }

            keyboardArray.push([Markup.button.callback(fix.сart + ` (${await summaTovar()} шт, ${(await summa()).toFixed(2)} ${fix.valut})`, `cart`)])     
        }

        if(user.orders.length > 0){

            // console.log(user.orders)


            const summa = async () => {
                return await user.orders.reduce(async function(a, b){
                    return await a + b.reduce(function(x, y){
                        return x + (y.price * y.inch)
                    }, 0)
                }, 0)
            }

            keyboardArray.push([Markup.button.callback('Заказы' + ` (${user.orders.length} шт, ${(await summa()).toFixed(2)} ${fix.valut})`, `myOrders`)])     
        }

        if(user.ordersArhiv.length > 0){

            const summa = async () => {
                let result
                return await user.ordersArhiv.reduce(async function(a, b){
                    return await a + b.reduce(function(x, y){
                        return x + (y.price * y.inch) 
                    }, 0)
                }, 0)
            }

            keyboardArray.push([Markup.button.callback(fix.arhiv + ` (${user.ordersArhiv.length} шт, ${(await summa()).toFixed(2)} ${fix.valut})`, `myArhiv`)])     
        }


        return Markup.inlineKeyboard(keyboardArray)
    }   
    catch(e){
        console.log('meinMenuDisplay\n' + e)
    }
}