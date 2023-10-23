import { integrations } from 'googleapis/build/src/apis/integrations/index.js';
import mongoose from '../database/index.js';

const ContasReceberSchema = new mongoose.Schema({
    documento: {
        type: String,
    },
    cliente: {
        type: String,
    },
    descricao: {
        type: String,
    },
    centrocusto: {
        type: String,
    },
    emissao: {
        type: Date,
    },
    vencimento: {
        type: Date,
    },
    valor: {
        type: Number,
        default: 0
    },
    saldo: {
        type: Number,
        default: 0
    },
    baixa: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const ContasReceber = mongoose.model('ContasReceber', ContasReceberSchema);

export default ContasReceber;