import { Accum } from "../models/Accum.js"

export const resultSearch = async (baza, text, reultCount) => {
    let res
    if(baza == 'Accum'){
        res = await Accum.find({$text: {$search: text}}, {score: {$meta: "textScore"}}).sort({score:{$meta: "textScore"}}).limit(reultCount)
    }
    return res
}
