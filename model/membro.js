import { integrations } from 'googleapis/build/src/apis/integrations/index.js';
import mongoose from '../database/index.js';

const MembroSchema = new mongoose.Schema({
    nomecompleto: {
        type: String,
        default: ''
    },
    nomereduzido: {
        type: String,
        default: ''
    },
    hierarquia: {
        type: String,
        default: ''
    },
    pessoaresponsavel: {
        type: String,
        default: ''
    },
    cidadenascimento: {
        type: String,
        default: ''
    },
    nacionalidade: {
        type: String,
        default: ''
    },
    sexo: {
        type: String,
        default: ''
    },
    datanascimento: {
        type: Date,
    },
    email: {
        type: String,
        default: ''
    },
    celular: {
        type: String,
        default: ''
    },
    endereco: {
        type: String,
        default: ''
    },
    bairro: {
        type: String,
        default: ''
    },
    cep: {
        type: String,
        default: ''
    },
    municipio: {
        type: String,
        default: ''
    },
    uf: {
        type: String,
        default: 'ES'
    },
    pontodereferencia: {
        type: String,
        default: ''
    },
    datamembro: {
        type: Date,
    },
    formaentrada: {
        type: String,
        default: ''
    },
    nivelescolaridade: {
        type: String,
        default: ''
    },
    profissao: {
        type: String,
        default: ''
    },
    cargonaigreja: {
        type: String,
        default: ''
    },
    estadocivil: {
        type: String,
        default: ''
    },
    conjuge: {
        type: String,
        default: ''
    },
    datacasamento: {
        type: Date,
    },
    nomedopai: {
        type: String,
        default: ''
    },
    nomedamae: {
        type: String,
        default: ''
    },
    identidade: {
        type: String,
        default: ''
    },
    cpf: {
        type: String,
        default: ''
    },
    ativo: {
        type: Boolean,
        default: true,
    },
    //0: Visitante, 1: Membro, 2: Líder de departamento, 3: filho de membro, A: Administrador, 
    nivel: {
        type: String,
        default: '1'
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Membro = mongoose.model('Membro', MembroSchema);

export default Membro;