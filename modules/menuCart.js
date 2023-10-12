import { Markup, Telegraf } from "telegraf"
import { fix } from "../fixConst.js"
import { Accum } from "../models/Accum.js"
const bot = new Telegraf(process.env.BOT_TOKEN)

export const meinCart = async (user, ctx) => {
    try{
        let step = 0
        const newAr = user.cart.slice(0)
        for(let i of newAr){
            const curItem = await Accum.findOne({_id: i.item})
            if(curItem){
                const keyboard = Markup.inlineKeyboard([Markup.button.callback('Оформить', `orderItem|${curItem._id}`), Markup.button.callback('Удалить', `deleteFromCart|${curItem._id}`)])
                const text = curItem.model +'\n' + curItem.price
                await bot.telegram.sendMessage(ctx.from.id, text, {...keyboard, parse_mode: 'HTML'}).catch(fix.errorDone)
            }
            else{
                user.cart.splice(step, 1)
                user.save()
            }
            step++
           
        }
    }   
    catch(e){
        console.log('meinCart\n' + e)
    }
}