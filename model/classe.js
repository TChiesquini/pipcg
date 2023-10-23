import { integrations } from 'googleapis/build/src/apis/integrations/index.js';
import mongoose from '../database/index.js';

const ClasseSchema = new mongoose.Schema({
    nome: {
        type: String,
    },
    descricao: {
        type: String,
    },
    faixaetaria: {
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

const Classe = mongoose.model('Classe', ClasseSchema);

export default Classe;