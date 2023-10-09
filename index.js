import 'dotenv/config'
import { Telegraf } from "telegraf"
import { db } from "./modules/db.js"
import { User } from "./models/User.js"
import { Device } from "./models/Device.js"

const bot = new Telegraf(process.env.BOT_TOKEN)
const option = {allowedUpdates: ['chat_member', 'callback_query', 'message', 'channel_post'], dropPendingUpdates: true}


async function test(){
    await db()
    // const dev = Device({model: 'Asus'})
    // await dev.save()
    const device = await Device.find({})
    device.forEach(async (item) => {
        await Device(item)
    })

    await device[0].deleteOne()
    // const device1 = device[0]
    // await device1.deleteOne()
    console.log(device)
    // await device.save()

    const user = await User.findOne({id: 1111, username: 'Dima'}, {_id: 0, username: 1})
    console.log(user)
    // const result = await user.deleteOne()
    // console.log(result)++-
}


test()

bot.start((ctx) => ctx.reply('Welcome'))




bot.launch(option)

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))