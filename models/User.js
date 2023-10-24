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
    },
    cartIndex: {
        type: Number,
        default: 0,
        required: true,
    },
    lastProd: {
        type: Array,
        default: [],
        required: true,
    },
    name: {
        type: String,
        default: 'Имя',
        required: true,
    },
    surname: {
        type: String,
        default: 'Фамилия',
        required: true,
    },
    lastname: {
        type: String,
        default: 'Отчество',
        required: true,
    },
    tel: {
        type: Number,
        default: 375,
        required: true,
    },
    email: {
        type: String,
        default: 'email',
        required: true,
    },
    clientStatus: {
        type: Boolean,
        default: false,
        required: true,
    },
    evropochta: {
        type: Number,
        default: 0,
        required: true,
    }
    }, {timestamps: true})

export const User = model(`User`, schema)

