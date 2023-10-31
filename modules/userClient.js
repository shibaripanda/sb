import { User } from "../models/User.js"
import { Data } from "../models/Data.js"

export const userClient = async (ctx) => {
    let user = await User.findOne({id: ctx.from.id})
    if(!user){
        await Data.updateOne({data: 'data'}, {$inc: {countUsers: 1}})
        user = User({id: ctx.from.id})
        await user.save()
    }
    return user
}