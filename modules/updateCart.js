import { Accum } from "../models/Accum.js"

export const updateCart = async (user) => {
    const oldCart = user.cart.slice(0)
    user.cart = []
    for(let i of oldCart){
        const device = await Accum.findOne({_id: i.origId})
        if(device){
            user.cart.push({
                origId: String(device._id),
                price: device.price,
                inch: i.inch,
                time: i.time
            })
        }
    }
}