import { integrations } from 'googleapis/build/src/apis/integrations/index.js';
import mongoose from '../database/index.js';

const BancoSchema = new mongoose.Schema({
    banco: {
        type: String,
    },
    agencia: {
        type: String,
    },
    conta: {
        type: String,
    },
    descricao: {
        type: String,
    },
    saldo: {
        type: Number,
    },
    ativo: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Banco = mongoose.model('Banco', BancoSchema);

export default Banco;