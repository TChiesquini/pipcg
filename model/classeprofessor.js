import { integrations } from 'googleapis/build/src/apis/integrations/index.js';
import mongoose from '../database/index.js';

const ClasseProfessorSchema = new mongoose.Schema({
    idclasse: {
        type: String,
    },
    nomeclasse: {
        type: String,
    },
    professor: {
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

const ClasseProfessor = mongoose.model('ClasseProfessor', ClasseProfessorSchema);

export default ClasseProfessor;