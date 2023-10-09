import { mongoose }  from 'mongoose'

const Schema = mongoose.Schema


const schema = new Schema({
    model: {
        type: String,
        required: true,
    }
    }, {timestamps: true})


export const Device = mongoose.model(`Device`, schema)