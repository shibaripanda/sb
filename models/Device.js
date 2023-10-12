import { Schema, model }  from 'mongoose'

const schema = new Schema({
    model: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    idProd: {
        type: String,
        required: true,
    }
    }, {timestamps: true})

export const Device = model(`Device`, schema)