import { mongoose }  from 'mongoose'

const Schema = mongoose.Schema


const schema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    username: {
        type: String,
        required: true,
    }
    }, {timestamps: true})


export const User = mongoose.model(`User`, schema)