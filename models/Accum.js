import { Schema, model }  from 'mongoose'

const schema = new Schema({
    model: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    }
    }, {timestamps: true})

export const Accum = model(`Accum`, schema)