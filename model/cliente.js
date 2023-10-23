import { integrations } from 'googleapis/build/src/apis/integrations/index.js';
import mongoose from '../database/index.js';

const ClienteSchema = new mongoose.Schema({
    nome: {
        type: String,
    },
    descricao: {
        type: String,
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

const Cliente = mongoose.model('Cliente', ClienteSchema);

export default Cliente;