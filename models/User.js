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
        type: Array,
        default: ['Имя'],
        required: true,
    },
    surname: {
        type: Array,
        default: ['Фамилия'],
        required: true,
    },
    lastname: {
        type: Array,
        default: ['Отчество'],
        required: true,
    },
    tel: {
        type: Array,
        default: ['+375XXXXXXXXX'],
        required: true,
    },
    email: {
        type: Array,
        default: ['email'],
        required: true,
    },
    clientStatus: {
        type: Boolean,
        default: false,
        required: true,
    },
    evropochta: {
        type: Array,
        default: ['0'],
        required: true,
    },
    orderHot: {
        type: String,
        default: 'empty',
        required: true,
    },
    orders: {
        type: Array,
        default: [],
        required: true,
    },
    orderIndex: {
        type: Number,
        default: 0,
        required: true,
    },
    ordersArhiv: {
        type: Array,
        default: [],
        required: true,
    }
    }, {timestamps: true})

export const User = model(`User`, schema)

