import db from './database/index.js';
import Membro from './model/membro.js';
import csv from 'csv-parser';
import fs from 'fs';

const dados = JSON.parse(fs.readFileSync('./example.json'));

function corrigeNome(string) {
  let str = string.toLowerCase()
  return str.charAt(0).toUpperCase() + str.slice(1);;
}

dados.forEach(element => {

  let nomereduzido = element.nomecompleto.split(" ")[0]
  let datanascimento = null
  let datacasamento = null

  if(element.datanascimento){
    datanascimento = element.datanascimento.substring(6,10)+'-'+element.datanascimento.substring(3,5)+'-'+element.datanascimento.substring(0,2)
    datanascimento = new Date(datanascimento);
  }

  let nivel = element.nivel;
  let sexo = element.sexo
  let nomecompleto = element.nomecompleto
  let hierarquia = element.hierarquia
  let pessoaresponsavel = element.pessoaresponsavel
  let cidadenascimento = element.cidadenascimento
  let nacionalidade = element.nacionalidade
  let endereco = corrigeNome(element.Logradouro)+' '+element.EndereçoPessoa
  let cep = element.cep
  let bairro = element.bairro
  let municipio = corrigeNome(element.municipio)
  let celular = element.celular
  let email = element.email
  let estadocivil = element.estadocivil
  let conjuge = element.conjuge

  if(element.datacasamento){
    datacasamento = element.datacasamento.substring(6,10)+'-'+element.datacasamento.substring(3,5)+'-'+element.datacasamento.substring(0,2)
    datacasamento = new Date(datacasamento);
  }

  let nomedopai = element.nomedopai
  let nomedamae = element.nomedamae
  let nivelescolaridade = element.nivelescolaridade
  let identidade = element.identidade
  let cpf = element.cpf
  let profissao = element.profissao

  let dados = {
    'nomecompleto': nomecompleto,
    'nomereduzido': nomereduzido,
    'hierarquia': hierarquia,
    'pessoaresponsavel': pessoaresponsavel,
    'cidadenascimento': cidadenascimento,
    'nacionalidade': nacionalidade,
    'sexo': sexo,
    'datanascimento': datanascimento,
    'email': email,
    'celular': celular,
    'endereco': endereco,
    'bairro': bairro,
    'cep': cep,
    'municipio': municipio,
    'uf': 'ES',
    'pontodereferencia': '',
    'datamembro': '',
    'formaentrada': '',
    'nivelescolaridade': nivelescolaridade,
    'profissao': profissao,
    'cargonaigreja': '',
    'estadocivil': estadocivil,
    'conjuge': conjuge,
    'datacasamento': datacasamento,
    'nomedopai': nomedopai,
    'nomedamae': nomedamae,
    'identidade': identidade,
    'cpf': cpf,
    'ativo': true,
    'nivel': nivel
  };

  Membro.create(dados);
});

console.log('Fim')