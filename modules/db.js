import { mongoose } from "mongoose"

export const db = async () => {
    await mongoose.connect(process.env.MONGO, {useNewUrlParser: true})
    .then((res) => console.log(`connect to DB`))
    .catch((error) => console.log(error))
}