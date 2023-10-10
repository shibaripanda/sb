import { Schema, model }  from 'mongoose'

const schema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    historyRequest: {
        type: Array,
        required: true,
    },
    requestMode: {
        type: Boolean,
        default: true,
        required: true,
    }
    }, {timestamps: true})

export const User = model(`User`, schema)

