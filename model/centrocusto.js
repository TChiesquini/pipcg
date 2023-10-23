import { integrations } from 'googleapis/build/src/apis/integrations/index.js';
import mongoose from '../database/index.js';

const CentroCustoSchema = new mongoose.Schema({
    superior: {
        type: String,
    },
    descricao: {
        type: String,
    },
    // S = Sintético, A = Analítico
    tipo: {
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

const CentroCusto = mongoose.model('CentroCusto', CentroCustoSchema);

export default CentroCusto;