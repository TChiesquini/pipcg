import { integrations } from 'googleapis/build/src/apis/integrations/index.js';
import mongoose from '../database/index.js';

const ConfigSchema = new mongoose.Schema({
    // Breve Catecismo - Pergunta
    bcpergunta: {
        type: String,
    },
    //Breve Catecismo - Resposta
    bcresposta: {
        type: String,
    },
    //Breve Catecismo - Referência Bíblica
    bcrefbiblica: {
        type: String,
    },
    //Versículo do dia - Versículo
    vdversiculo: {
        type: String,
    },
    //Versículo do dia - Referência
    vdreferencia: {
        type: String,
    },
    //Palavra do Pastor - Texto
    pptexto: {
        type: String,
    },
    videologin: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Config = mongoose.model('Config', ConfigSchema);

export default Config;