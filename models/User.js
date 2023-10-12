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
    },
    currentStatus: {
        type: String,
        default: 'Main',
        required: true,
    },
    cart: {
        type: Array,
        required: true,
    },
    lastMes: {
        type: Number,
        default: 0,
        required: true,
    },
    startMes: {
        type: Number,
        default: 0,
        required: true,
    },
    bufferSearch: {
        type: Object,
        default: [],
        required: true,
    }
    }, {timestamps: true})

export const User = model(`User`, schema)

