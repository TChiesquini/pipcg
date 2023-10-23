//const mongoose = require(`${__dir}/database`);
import mongoose from '../database/index.js';

const MessageSchema = new mongoose.Schema({
    empresa: {
        type: String,
    },
    loja: {
        type: String,
    },
    datain: {
        type: String,
    },
    horain: {
        type: String,
    },
    equipamento: {
        type: String,
    },
    tipoalerta: {
        type: String,
    },
    titulo: {
        type: String,
    },
    corpo: {
        type: String,
    },
    problema: {
        type: String,
    },
    lido: {
        type: Boolean,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Message = mongoose.model('Message', MessageSchema);

export default Message;