import { integrations } from 'googleapis/build/src/apis/integrations/index.js';
import mongoose from '../database/index.js';
import { now } from 'mongoose';

const MovBancarioSchema = new mongoose.Schema({
    banco: {
        type: String,
    },
    datamovimento: {
        type: Date,
    },
    centrocusto: {
        type: String,
    },
    documento: {
        type: String,
    },
    iddocumento: {
        type: String,
    },
    fornecedorcliente: {
        type: String,
    },
    historico: {
        type: String,
    },
    valor: {
        type: Number,
    },
    juros: {
        type: Number,
        default: 0
    },
    desconto: {
        type: Number,
        default: 0
    },
    // P = Contas a pagar, R = Contas a receber, M = Mov Bancario, D = Dizimo, O = Oferta
    tipo: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const MovBancario = mongoose.model('MovBancario', MovBancarioSchema);

export default MovBancario;