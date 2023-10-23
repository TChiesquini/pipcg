import { integrations } from 'googleapis/build/src/apis/integrations/index.js';
import mongoose from '../database/index.js';

const EventosIncricaoSchema = new mongoose.Schema({
    // ID do evento
    idevento: {
        type: String,
    },
    // ID do inscrito
    idinscrito: {
        type: String,
    },
    // data e hora da inscricao
    data: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const EventosInscricao = mongoose.model('EventosInscricao', EventosInscricaoSchema);

export default EventosInscricao;