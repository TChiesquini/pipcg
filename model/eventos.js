import { integrations } from 'googleapis/build/src/apis/integrations/index.js';
import mongoose from '../database/index.js';

const EventosSchema = new mongoose.Schema({
    // nome do evento
    evento: {
        type: String,
    },
    // descricao do evento
    descricao: {
        type: String,
    },
    // data e hora do evento
    data: {
        type: Date,
    },
    // caso tenha participantes, limita a inscrição
    participantes: {
        type: Number,
    },
    // onde será realizado o evento
    local: {
        type: String,
    },
    // especificação do local
    descricaolocal: {
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

const Eventos = mongoose.model('Eventos', EventosSchema);

export default Eventos;