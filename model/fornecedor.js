import { integrations } from 'googleapis/build/src/apis/integrations/index.js';
import mongoose from '../database/index.js';

const FornecedorSchema = new mongoose.Schema({
    nome: {
        type: String,
    },
    descricao: {
        type: String,
    },
    // F = Pessoa Fisica (CPF), J = Pessoa Juridica (CNPJ)
    tipo: {
        type: String,
    },
    cnpj: {
        type: String,
    },
    cpf: {
        type: String,
    },
    endereco: {
        type: String,
    },
    bairro: {
        type: String,
    },
    municipio: {
        type: String,
    },
    uf: {
        type: String,
    },
    cep: {
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

const Fornecedor = mongoose.model('Fornecedor', FornecedorSchema);

export default Fornecedor;