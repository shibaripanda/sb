import { User } from "../models/User.js"

export const userClient = async (ctx) => {
    let user = await User.findOne({id: ctx.from.id})
    if(!user){
        user = User({id: ctx.from.id})
        await user.save()
    }
    return user
}