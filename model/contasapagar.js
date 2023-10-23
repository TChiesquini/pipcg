import { integrations } from 'googleapis/build/src/apis/integrations/index.js';
import mongoose from '../database/index.js';

const ContasPagarSchema = new mongoose.Schema({
    documento: {
        type: String,
    },
    fornecedor: {
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
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const ContasPagar = mongoose.model('ContasPagar', ContasPagarSchema);

export default ContasPagar;