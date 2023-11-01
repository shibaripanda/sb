import { Schema, model }  from 'mongoose'

const schema = new Schema({
    data: {
        type: String,
        default: 'data',
        required: true,
    },
    globalNumber: {
        type: Number,
        default: 0,
        required: true,
    },
    countOrders: {
        type: Number,
        default: 1,
        required: true,
    },
    countUsers: {
        type: Number,
        default: 1,
        required: true,
    }
    }, {timestamps: true})

export const Data = model(`Data`, schema)

