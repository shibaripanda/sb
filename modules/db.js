import { mongoose } from "mongoose"

export const db = async () => {
    let status = false
    const result = await mongoose.connect(process.env.MONGO, {useNewUrlParser: true})
    .then((res) => {
        console.log(`connect to DB`)
        status = true
    })
    .catch((error) => console.log(error))
    return status
}