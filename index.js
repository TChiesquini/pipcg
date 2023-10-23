import fetch from "node-fetch";
import { readFile } from 'fs/promises';
import express from "express";
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
//import { ObjectId, ConnectionReadyEvent } from 'mongodb';
import multer from 'multer';
import path from 'path';
//import { glob } from 'glob';
import { fileURLToPath } from 'url';
import https from 'https';
import fs from 'fs';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import { google } from 'googleapis';

import Message from './model/messaging.js';
import Membro from './model/membro.js';

import Fornecedor from './model/fornecedor.js';
import Cliente from './model/cliente.js';
import Banco from './model/banco.js';
import CentroCusto from './model/centrocusto.js';
import ContasAPagar from './model/contasapagar.js';
import ContasAReceber from './model/contasareceber.js';
import MovBancario from './model/movbancario.js';
import Classe from './model/classe.js';
//import ClasseProfessor from './model/classeprofessor.js';
import Configuracao from './model/configuracao.js';

import Eventos from "./model/eventos.js";

import listaMembro from './src/functions/listamembro.js';
import fichaMembro from './src/functions/fichamembro.js';
import listafaixaetaria from './src/functions/listafaixaetaria.js';

//import axios from 'axios'
//import FormData from "form-data";

import request from 'request';
import {} from 'dotenv/config'

const apiKey = process.env.OPENAI_API_KEY;
//const apiKey = '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';
const organization = 'Pantheon';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega o certificado e a key necessários para a configuração.
const options = {
  key: fs.readFileSync("//etc/letsencrypt/live/nova.monitor.eco.br/privkey.pem"),
  cert: fs.readFileSync("//etc/letsencrypt/live/nova.monitor.eco.br/fullchain.pem")
};

const app = express();
const serviceAccount = JSON.parse(
  await readFile(
    new URL('./chave.json', import.meta.url)
  )
);

global.__dir = __dirname;

app.use(express.static("src"));

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

var httpsServer = https.createServer(options, app);

app.get('/', function(req, res) {
  res.sendFile(path.join(`${__dir}/src/html/index.html`));
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

httpsServer.listen(3006,function(erro){
    if(erro){
        console.log("Ocorreu um erro!")
    }else{
        console.log("Servidor iniciado com sucesso!")
    }
})

/////////
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.text({ type: 'text/xml' }));
app.use(bodyParser.text({ type: 'text/csv' }));
app.use(compression());

app.use(cors());
app.use(express.static("src"));

app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );

app.use(
helmet.contentSecurityPolicy({
    directives: {
    "script-src": ["'self'", "https://www.gstatic.com"],
    "style-src": null,
    },
})
);
////////

const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/cloud-platform';
const SCOPES = [MESSAGING_SCOPE];

function getAccessToken() {
return new Promise(function(resolve, reject) {
    const jwtClient = new google.auth.JWT(
    serviceAccount.client_email,
    null,
    serviceAccount.private_key,
    SCOPES,
    null
    );
    jwtClient.authorize(function(err, tokens) {
    if (err) {
        reject(err);
        return;
    }
    resolve(tokens.access_token);
    });
});
}

const sendMessage = async (message) => {
    
    const accessToken = await getAccessToken();
    const response = await fetch('https://fcm.googleapis.com/v1/projects/pipcg-3d2a8/messages:send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    const data = await response.json();
    return data;
  };

app.get('/sendmessage/:title/:body', async function(req,res,next){

  var formatter = new Intl.DateTimeFormat('pt-BR');
  var date = new Date();

  var body = req.params.body;
  var codigo = body.substring(6,10).trim(); //Código da loja completo
  var codigoEmpresa; //Código da EMPRESA
  var codigoLoja; //Número da LOJA
  if(codigo.length == 6){
	  codigoEmpresa = codigo.substring(0,2);
    codigoLoja = codigo.substring(0,4);
  }else{
	  codigoEmpresa = codigo.substring(0,3);
	  codigoLoja = codigo.substring(0,5);
  } 
  
  var indexDevice = body.indexOf('Device');
  var indexProblema = body.indexOf('Problema');
  var codigoDevice = body.substring(indexDevice+7, indexProblema).trim();
  var codigoProblema = body.substring(indexProblema+9).trim();

  const resposta1 = await sendMessage(
    {
        "message": {
          "topic": codigoEmpresa,
          "notification": {
            "title": req.params.title,
            "body": req.params.body
          },
          "android": {
            "notification": {       
              "default_sound": true,
              "default_vibrate_timings": true,
              "default_light_settings": true
            },
            "priority": "high"
          },
          "apns": {
            "payload": {
              "aps": {
                "category": "NEW_MESSAGE_CATEGORY"
              }
            }
          }
        }
    }
);

const resposta2 = await sendMessage(
  {
      "message": {
        "topic": `${codigoLoja}`,
        "notification": {
          "title": req.params.title,
          "body": req.params.body
        },
        "android": {
          "notification": {       
            "default_sound": true,
            "default_vibrate_timings": true,
            "default_light_settings": true
          },
          "priority": "high"
        },
        "apns": {
          "payload": {
            "aps": {
              "category": "NEW_MESSAGE_CATEGORY"
            }
          }
        }
      }
  }
);

  const message = await Message.create({
    empresa: codigoEmpresa,
    loja: codigoLoja,
    device: codigoDevice,
    problema: codigoProblema,
    tipoalerta: 'alerta',
    datain: formatter.format(date),
    horain: new Date().toLocaleTimeString(),
    titulo: req.params.title,
    corpo: req.params.body
  });

  console.log(message);

  if(resposta1.name){
    res.status(200).send(`Mensagem enviada com sucesso!! ${resposta1.name}`)
  }else{
    res.status(400).send(resposta1)
  }

});

app.put('message/:id', async function(req,res){

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    const dados = req.body;
    res.status(200).json(await Message.updateOne({ "_id" : id },{$set: dados}));
  }catch{
    res.status(400).json({erro:`${ex}`});
  }

})

app.get('/messagehistor/:codloja?/:filtro?', async function(req,res,next){

  let loja = [];
  let corpo = '';

  if (req.params.filtro != null){
    corpo = req.params.filtro;
  }

  if (req.params.codloja.length>2) {
    let lojas = req.params.codloja.replaceAll("\t","").replaceAll('"','').trim().substring(1,req.params.codloja.replaceAll("\t","").replaceAll('"','').trim().length-1).split(",");

    for (let lj of lojas) {

      let dados = await Loja.findOne({'_id': {_id:new mongoose.Types.ObjectId(lj)} })
      loja.push(dados.codigoloja);
    }

  }

  try{
    if(loja.length > 0){
      res.status(200).json(await Message.find({"loja": {$in: loja},"corpo": {"$regex": corpo, $options:'i'}}).sort({'createdAt': -1}));
    }else{
      res.status(200).json(await Message.find({"corpo": {"$regex": corpo, $options:'i'}}).sort({'createdAt': -1}));
    }
  }
  catch(ex){
      res.status(400).json({erro:`${ex}`});
  }
  
});

app.get('/message/:codloja?/:filtro?', async function(req,res,next){

  let loja = [];
  let corpo = '';
  let datalimite = new Date();
  datalimite.setDate(datalimite.getDate()-2)

  if (req.params.filtro != null){
    corpo = req.params.filtro;
  }

  if (req.params.codloja.length>2) {
    let lojas = req.params.codloja.replaceAll("\t","").replaceAll('"','').trim().substring(1,req.params.codloja.replaceAll("\t","").replaceAll('"','').trim().length-1).split(",");

    for (let lj of lojas) {

      let dados = await Loja.findOne({'_id': {_id:new mongoose.Types.ObjectId(lj)} })
      loja.push(dados.codigoloja);
    }

  }

  try{
    if(loja.length > 0){
      res.status(200).json(await Message.find({"createdAt": { $gte: datalimite },"loja": {$in: loja},"corpo": {"$regex": corpo, $options:'i'}}).sort({'createdAt': -1}));
    }else{
      res.status(200).json(await Message.find({"createdAt": { $gte: datalimite }, "corpo": {"$regex": corpo, $options:'i'}}).sort({'createdAt': -1}));
    }
  }
  catch(ex){
      res.status(400).json({erro:`${ex}`});
  }
  
});

///////////Membro

app.post('/membro', async (req, res) => {

  let email = req.body.email;
  let celular = req.body.celular
  let datanascimento = null
  let datacasamento = null
  let datamembro = null

  try{
    if(await Membro.findOne({'email': email })){
      return res.status(400).json({ erro: "Usuário já cadastrado - email!"});
    } else if(await Membro.findOne({'celular': celular })){
      return res.status(400).json({ erro: "Usuário já cadastrado - celular!"});
    } else{ 

      let dados = req.body;

      let nivel = req.body.nivel;
      let sexo = req.body.sexo
      let nomecompleto = req.body.nomecompleto
      let nomereduzido = nomecompleto.split(" ")[0]
      let hierarquia = req.body.hierarquia
      let pessoaresponsavel = req.body.pessoaresponsavel
      let cidadenascimento = req.body.cidadenascimento
      let nacionalidade = req.body.nacionalidade
      let endereco = req.body.endereco
      let cep = req.body.cep
      let bairro = req.body.bairro
      let municipio = req.body.municipio
      let uf = req.body.uf
      let celular = req.body.celular
      let email = req.body.email
      let estadocivil = req.body.estadocivil
      let conjuge = req.body.conjuge
  
      if(req.body.datanascimento=='null'){
        datanascimento = null;
      }else{
        let newdata = req.body.datanascimento.substrin(6,10)+'-'+req.body.datanascimento.substrin(3,5)+'-'+req.body.datanascimento.substrin(0,2)
        datanascimento = new Date(newdata)
      }
      
      if(req.body.datacasamento=='null'){
        datacasamento = null;
      }else{
        let newdata = req.body.datacasamento.substrin(6,10)+'-'+req.body.datacasamento.substrin(3,5)+'-'+req.body.datacasamento.substrin(0,2)
        datacasamento = new Date(newdata);
      }
  
      if(req.body.datamembro=='null'){
        datamembro = null
      }else{
        let newdata = req.body.datamembro.substrin(6,10)+'-'+req.body.datamembro.substrin(3,5)+'-'+req.body.datamembro.substrin(0,2)
        datamembro = new Date(newdata)
      }
  
      let nomedopai = req.body.nomedopai
      let nomedamae = req.body.nomedamae
      let nivelescolaridade = req.body.nivelescolaridade
      let identidade = req.body.identidade
      let cpf = req.body.cpf
      let profissao = req.body.profissao
      let ativo = req.body.ativo
      let pontodereferencia = req.body.pontodereferencia
      let formaentrada = req.body.formaentrada
      let cargonaigreja = req.body.cargonaigreja
  
      dados = {
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
        'uf': uf,
        'pontodereferencia': pontodereferencia,
        'datamembro': req.body.datamembro,
        'formaentrada': formaentrada,
        'nivelescolaridade': nivelescolaridade,
        'profissao': profissao,
        'cargonaigreja': cargonaigreja,
        'estadocivil': estadocivil,
        'conjuge': conjuge,
        'datacasamento': datacasamento,
        'nomedopai': nomedopai,
        'nomedamae': nomedamae,
        'identidade': identidade,
        'cpf': cpf,
        'ativo': ativo,
        'nivel': nivel
      };

      const membro = await Membro.create(dados);

      membro.password = undefined;

      return res.status(200).send({ membro });      
    }
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.get('/membro/:id?', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    if(req.params.id){
      res.status(200).json(await Membro.findOne({'_id': id }));
    } else {
      res.status(200).json(await Membro.find().sort({'nomecompleto': 1}));
    }
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.get('/membromail/:email', async (req, res) => {

  try{
    if(await Membro.findOne({'email': req.params.email },{'ativo': true})){
      res.status(200).json(await Membro.findOne({'email': req.params.email }));
    }else{
      res.status(501).json({ erro: `${"email não encontrado"}`});
    }
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.get('/membrofaixa/:inicial/:final', async (req, res) => {

  let inicial = req.params.inicial;
  let final = req.params.final;

  const dataAtual = new Date();
  const dataMinima = new Date(dataAtual.getFullYear() - final , dataAtual.getMonth(), dataAtual.getDate());
  const dataMaxima = new Date(dataAtual.getFullYear() - inicial, dataAtual.getMonth(), dataAtual.getDate());

  try{
    res.status(200).json(await Membro.find({
      datanascimento: { $gte: dataMinima, $lt: dataMaxima },
    }).sort({'nomecompleto': 1}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.get('/membroTotais', async (req, res) => {

  var data = new Date();
  var diadehoje = data.getDate();

  // O primeiro dia é o dia do mês, menos o dia da semana
  var primeiro = data.getDate() - data.getDay(); 

  var primeiroDia = new Date(data.setDate(primeiro)).toUTCString();
  var ultimoDia = new Date(data.setDate(data.getDate()+6)).toUTCString();

  var primeiroDiaProximaSemana = new Date(data.setDate(primeiro+7)).toUTCString();
  var ultimoDiaProximaSemana = new Date(data.setDate(data.getDate()+6)).toUTCString();  

  var diahoje = new Date(data.setDate(diadehoje)).toUTCString();
  var d30atras = new Date(data.setMonth(data.getMonth()-1)).toUTCString();

  try{
    const membroComCargo = await Membro.find({cargonaigreja: { $ne: null }} ,{ativo: true}).count();

    const membroGeral = await Membro.find().count();
    var membroAtivo = await Membro.find({'ativo': true}).count();
    var membroVisitante = await Membro.find({'nivel': '0'}).count();
    var membroFilhodeMembro = await Membro.find({'nivel': '3'}).count();
    const membroGeralFeminino = await Membro.find({'sexo': 'Feminino'}).count();
    const membroGeralMasculino = await Membro.find({'sexo': 'Masculino'}).count();

    const dizimos = await MovBancario.aggregate([
      {
        $match: {
          tipo: { $in: ['D','O']}, 
          datamovimento: {
            $gte: new Date(d30atras),
            $lte: new Date(diahoje)
          },
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: '$datamovimento' }, // Agrupar por dia da emissão
          totalValor: { $sum: "$valor" }, // Somar os valores por dia
          datamovimento: { $first: "$datamovimento" } // Pegar a data de emissão (dia) do primeiro documento do grupo
        }
      },
      {
        $project: {
          _id: 0, // Exclua o campo _id da saída
          dia: "$_id", // Renomeie o campo _id para dia
          totalValor: 1, // Inclua o campo totalValor
          datamovimento: 1, // Inclua o campo de emissão
        }
      }
    ]).sort({'datamovimento': 1});

    const aniversariantedaSemana = await Membro.find({
      datanascimento: {
        $exists: true,
      },
      $expr: {
        $and: [
          {$gte: [{ "$month": "$datanascimento" }, new Date(primeiroDia).getMonth()+1 ] },
          {$lte: [{ "$month": "$datanascimento" }, new Date(ultimoDia).getMonth()+1 ] },
          {$gte: [{ "$dayOfMonth": "$datanascimento" }, new Date(primeiroDia).getDate()+1 ] },
          {$lte: [{ "$dayOfMonth": "$datanascimento" }, new Date(ultimoDia).getDate()+1 ]}
        ]
      }
    }).sort({
       "datanascimento" : 1
    })

    var saldobancario = await saldoBancario();

    const contaspagarEssaSemana = await ContasAPagar.find({
      $expr: {
        $and: [
          { $ne: ['$saldo', 0] },
          { $gte: ['$vencimento',  primeiroDia ]},
          { $lte: ['$vencimento',  ultimoDia ] },
        ]
      },
    });

    let saldoCPEssaSemana = 0;

    contaspagarEssaSemana.forEach( function(cp) {
      saldoCPEssaSemana += cp.saldo
    })

    const contaspagarProximaSemana = await ContasAPagar.find({
      $expr: {
        $and: [
          { $ne: ['$saldo', 0] },
          { $gte: ['$vencimento',  primeiroDiaProximaSemana ]},
          { $lte: ['$vencimento',  ultimoDiaProximaSemana ] },
        ]
      },
    });

    let saldoCPProximaSemana = 0;

    contaspagarProximaSemana.forEach( function(cp) {
      saldoCPProximaSemana += cp.saldo
    })

    res.status(200).json({'membroGeral': membroGeral == null ? '0' : membroGeral,'membroAtivo': membroAtivo == null ? '0' : membroAtivo, 
      'membroVisitante': membroVisitante == null ? '0' : membroVisitante, 'membroGeralFeminino': membroGeralFeminino == null ? '0' : membroGeralFeminino,
      'membroGeralMasculino': membroGeralMasculino == null ? '0' : membroGeralMasculino, 'membroComCargo': membroComCargo == null ? '0' : membroComCargo, 
      'saldobancario': saldobancario == null ? '0' : Number(saldobancario.toFixed(2)), 'membroFilhodeMembro': membroFilhodeMembro == null ? '0' : membroFilhodeMembro, 
      'saldoCPEssaSemana': saldoCPEssaSemana == null ? '0' : Number(saldoCPEssaSemana.toFixed(2)), 
      'saldoCPProximaSemana': saldoCPProximaSemana == null ? '0' : Number(saldoCPProximaSemana.toFixed(2)), 
      'aniversariantedaSemana': aniversariantedaSemana, 'dizimos': dizimos})

  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.delete('/membro/:id', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};  

  try{
    res.status(200).json(await Membro.deleteOne({'_id': id }));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.put('/membrostatus/:id', async (req, res) => {
  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};  

  try{
    res.status(200).json(await Membro.updateOne({ "_id" : id },{$set: req.body}));
  }catch{
    res.status(400).json({ erro: `${ex}` });
  }
})

app.put('/membro/:id', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};  
  let datanascimento = ''
  let datacasamento = ''
  let datamembro = ''

  try{
    let dados = req.body;

    let nivel = req.body.nivel;
    let sexo = req.body.sexo
    let nomecompleto = req.body.nomecompleto
    let nomereduzido = nomecompleto.split(" ")[0]
    let hierarquia = req.body.hierarquia
    let pessoaresponsavel = req.body.pessoaresponsavel
    let cidadenascimento = req.body.cidadenascimento
    let nacionalidade = req.body.nacionalidade
    let endereco = req.body.endereco
    let cep = req.body.cep
    let bairro = req.body.bairro
    let municipio = req.body.municipio
    let uf = req.body.uf
    let celular = req.body.celular
    let email = req.body.email
    let estadocivil = req.body.estadocivil
    let conjuge = req.body.conjuge
  
    if(req.body.datanascimento =='null' || req.body.datanascimento === undefined){
      datanascimento = null;
    }else{
      let newdata = req.body.datanascimento.substring(6,10)+'-'+req.body.datanascimento.substring(3,5)+'-'+req.body.datanascimento.substring(0,2)
      datanascimento = new Date(newdata)
    }
    
    if(req.body.datacasamento =='null' || req.body.datacasamento === undefined){
      datacasamento = null;
    }else{
      let newdata = req.body.datacasamento.substring(6,10)+'-'+req.body.datacasamento.substring(3,5)+'-'+req.body.datacasamento.substring(0,2)
      datacasamento = new Date(newdata);
    }

    if(req.body.datamembro =='null' || req.body.datamembro === undefined){
      datamembro = null
    }else{
      let newdata = req.body.datamembro.substring(6,10)+'-'+req.body.datamembro.substring(3,5)+'-'+req.body.datamembro.substring(0,2)
      datamembro = new Date(newdata)
    }

    let nomedopai = req.body.nomedopai
    let nomedamae = req.body.nomedamae
    let nivelescolaridade = req.body.nivelescolaridade
    let identidade = req.body.identidade
    let cpf = req.body.cpf
    let profissao = req.body.profissao
    let ativo = req.body.ativo
    let pontodereferencia = req.body.pontodereferencia
    let formaentrada = req.body.formaentrada
    let cargonaigreja = req.body.cargonaigreja

    dados = {
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
      'uf': uf,
      'pontodereferencia': pontodereferencia,
      'datamembro': datamembro,
      'formaentrada': formaentrada,
      'nivelescolaridade': nivelescolaridade,
      'profissao': profissao,
      'cargonaigreja': cargonaigreja,
      'estadocivil': estadocivil,
      'conjuge': conjuge,
      'datacasamento': datacasamento,
      'nomedopai': nomedopai,
      'nomedamae': nomedamae,
      'identidade': identidade,
      'cpf': cpf,
      'ativo': ativo,
      'nivel': nivel
    };
    
    res.status(200).json(await Membro.updateOne({ "_id" : id },{$set: dados}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }

});

///////////EBD

// Classe
app.post('/classe', async (req, res) => {

  try{
      const classe = await Classe.create(req.body);

      return res.status(200).send({ classe });      
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.get('/classe/:id?', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    if(req.params.id){
      res.status(200).json(await Classe.findOne({'_id': id }));
    } else {
      res.status(200).json(await Classe.find());
    }
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.delete('/classe/:id', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};  

  try{
    res.status(200).json(await Classe.deleteOne({'_id': id }));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.put('/classe/:id', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};  

  try{
    const dados = req.body;
    
    res.status(200).json(await Classe.updateOne({ "_id" : id },{$set: dados}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }

});

///////////FINANCEIRO

// Fornecedor
app.post('/fornecedor', async (req, res) => {

  try{
      const fornecedor = await Fornecedor.create(req.body);

      return res.status(200).send({ fornecedor });      
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.get('/fornecedor/:id?', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    if(req.params.id){
      res.status(200).json(await Fornecedor.findOne({'_id': id }));
    } else {
      res.status(200).json(await Fornecedor.find());
    }
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.delete('/fornecedor/:id', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};  

  try{
    res.status(200).json(await Fornecedor.deleteOne({'_id': id }));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.put('/fornecedor/:id', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};  

  try{
    const dados = req.body;
    
    res.status(200).json(await Fornecedor.updateOne({ "_id" : id },{$set: dados}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }

});


// Cliente
app.post('/cliente', async (req, res) => {

  try{
      const cliente = await Cliente.create(req.body);

      return res.status(200).send({ cliente });      
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.get('/cliente/:id?', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    if(req.params.id){
      res.status(200).json(await Cliente.findOne({'_id': id }));
    } else {
      res.status(200).json(await Cliente.find());
    }
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.delete('/cliente/:id', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};  

  try{
    res.status(200).json(await Cliente.deleteOne({'_id': id }));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.put('/cliente/:id', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};  

  try{
    const dados = req.body;
    
    res.status(200).json(await Cliente.updateOne({ "_id" : id },{$set: dados}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }

});


// Banco
app.post('/banco', async (req, res) => {

  try{
      const banco = await Banco.create(req.body);

      return res.status(200).send({ banco });      
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.get('/banco/:id?', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    if(req.params.id){
      res.status(200).json(await Banco.findOne({'_id': id }));
    } else {
      res.status(200).json(await Banco.find());
    }
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.delete('/banco/:id', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};  

  try{
    res.status(200).json(await Banco.deleteOne({'_id': id }));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.put('/banco/:id', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};  

  try{
    const dados = req.body;
    
    res.status(200).json(await Banco.updateOne({ "_id" : id },{$set: dados}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }

});

app.get('/bancoSaldo/:id', async (req, res) => {

  try{
    let saldo = await saldoBancarioId(req.params.id);
    res.status(200).json({'Saldo': saldo});
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

// Centro de Custo
app.post('/centrocusto', async (req, res) => {

  try{
      const centrocusto = await CentroCusto.create(req.body);

      return res.status(200).send({ centrocusto });      
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.get('/centrocusto/:id?', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    if(req.params.id){
      res.status(200).json(await CentroCusto.findOne({'_id': id }));
    } else {
      res.status(200).json(await CentroCusto.find());
    }
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.get('/centrocustoanalitico', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
      res.status(200).json(await CentroCusto.find({'tipo': 'Analítico'}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.get('/centrocustosintetico', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
      res.status(200).json(await CentroCusto.find({'tipo': 'Sintético'}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.delete('/centrocusto/:id', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};  

  try{
    res.status(200).json(await CentroCusto.deleteOne({'_id': id }));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.put('/centrocusto/:id', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};  

  try{
    const dados = req.body;
    
    res.status(200).json(await CentroCusto.updateOne({ "_id" : id },{$set: dados}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }

});

// Contas a Pagar
app.post('/contaspagar', async (req, res) => {

  try{
      const contaspagar = await ContasAPagar.create(req.body);

      return res.status(200).send({ contaspagar });      
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.get('/contaspagar/:id?', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    if(req.params.id){
      res.status(200).json(await ContasAPagar.findOne({'_id': id }));
    } else {
      res.status(200).json(await ContasAPagar.find());
    }
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.delete('/contaspagar/:id', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};  

  try{
    res.status(200).json(await ContasAPagar.deleteOne({'_id': id }));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.put('/contaspagar/:id', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};  

  try{
    const dados = req.body;
    
    res.status(200).json(await ContasAPagar.updateOne({ "_id" : id },{$set: dados}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }

});

// Contas a Receber
app.post('/contasreceber', async (req, res) => {

  try{
      const contasreceber = await ContasAReceber.create(req.body);

      return res.status(200).send({ contasreceber });      
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.get('/contasreceber/:id?', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    if(req.params.id){
      res.status(200).json(await ContasAReceber.findOne({'_id': id }));
    } else {
      res.status(200).json(await ContasAReceber.find());
    }
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.delete('/contasreceber/:id', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};  

  try{
    res.status(200).json(await ContasAReceber.deleteOne({'_id': id }));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.put('/contasreceber/:id', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};  

  try{
    const dados = req.body;
    
    res.status(200).json(await ContasAReceber.updateOne({ "_id" : id },{$set: dados}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }

});

// Movimento Bancário
app.post('/movbancario', async (req, res) => {

  try{
      const movbancario = await MovBancario.create(req.body);

      return res.status(200).send({ movbancario });      
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.get('/movbancario/:id?', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    if(req.params.id){
      res.status(200).json(await MovBancario.findOne({'_id': id }));
    } else {
      res.status(200).json(await MovBancario.find());
    }
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.get('/movbancarioBaixa/:idTitulo', async (req, res) => {

//  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    res.status(200).json(await MovBancario.find({'iddocumento': req.params.idTitulo}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.delete('/movbancario/:id', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};  

  try{
    res.status(200).json(await MovBancario.deleteOne({'_id': id }));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.put('/movbancario/:id', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};  

  try{
    const dados = req.body;
    
    res.status(200).json(await MovBancario.updateOne({ "_id" : id },{$set: dados}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }

});

// Calculo saldo bancário

async function saldoBancario() {

  let saldo = 0;

  const movimentos = await MovBancario.find().sort({'datamovimento': 1});

  movimentos.forEach( function(mov) {
    if(mov.tipo=='P'){
      saldo -= (mov.valor+mov.juros-mov.desconto)
    }else if (mov.tipo=='R'){
      saldo += (mov.valor+mov.juros-mov.desconto)
    }else if (mov.tipo=='M'){
      if(mov.valor>0){
        saldo += (mov.valor+mov.juros-mov.desconto)
      }else{
        saldo -= (mov.valor+mov.juros-mov.desconto)
      }
    }else{
      saldo += (mov.valor+mov.juros-mov.desconto)
    }
  
  })

  return saldo
}

async function saldoBancarioId(idBanco) {

  let saldo = 0;

  const movimentos = await MovBancario.find({'banco': idBanco}).sort({'datamovimento': 1});

  movimentos.forEach( function(mov) {
    if(mov.tipo=='P'){
      saldo -= (mov.valor+mov.juros-mov.desconto)
    }else if (mov.tipo=='R'){
      saldo += (mov.valor+mov.juros-mov.desconto)
    }else if (mov.tipo=='M'){
      if(mov.valor>0){
        saldo += (mov.valor+mov.juros-mov.desconto)
      }else{
        saldo -= (mov.valor+mov.juros-mov.desconto)
      }
    }else{
      saldo += (mov.valor+mov.juros-mov.desconto)
    }
  
  })

  return saldo
}

// Configurações
app.post('/configuracao', async (req, res) => {

  try{
      const configuracao = await Configuracao.create(req.body);

      return res.status(200).send({ configuracao });      
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.get('/configuracao', async (req, res) => {


  try{
      res.status(200).json(await Configuracao.find());
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.put('/configuracao/:id', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};  

  try{
    const dados = req.body;
    
    res.status(200).json(await Configuracao.updateOne({ "_id" : id },{$set: dados}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }

});

app.delete('/configuracao/:id', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};  

  try{
    res.status(200).json(await Configuracao.deleteOne({'_id': id }));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});


// Eventos
app.post('/evento', async (req, res) => {

  try{
      const classe = await Eventos.create(req.body);

      return res.status(200).send({ classe });      
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.get('/evento/:id?', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    if(req.params.id){
      res.status(200).json(await Eventos.findOne({'_id': id }));
    } else {
      res.status(200).json(await Eventos.find());
    }
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.delete('/evento/:id', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};  

  try{
    res.status(200).json(await Eventos.deleteOne({'_id': id }));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}`});
  }

});

app.put('/evento/:id', async (req, res) => {

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};  

  try{
    let dados = req.body;
    let data = req.body.data

    if(req.body.data =='null' || req.body.data === undefined){
      data = null;
    }else{
      let newdata = req.body.data.substring(6,10)+'-'+req.body.data.substring(3,5)+'-'+req.body.data.substring(0,2)+' '+req.body.data.substring(13,20)
      data = new Date(newdata)
    }
    let evento = req.body.evento;
    let descricao = req.body.descricao;
    let descricaolocal = req.body.descricaolocal;
    let participantes = req.body.participantes;
    let local = req.body.local;
    let ativo = req.body.ativo;

    dados = {
      "evento": evento,
      "descricao": descricao,
      "descricaolocal": descricaolocal,
      "participantes": participantes,
      "local": local,
      "data": data,
      "ativo": ativo
    }
    
    res.status(200).json(await Eventos.updateOne({ "_id" : id },{$set: dados}));
  }
  catch(ex){
    res.status(400).json({ erro: `${ex}` });
  }

});

//

// Tratamento de imagem

app.use(express.static('/home/tony/pipcg/pipcgimg/'));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, req.params.tipo=='E' 
      ? '/home/tony/pipcg/pipcgimg/eventos' 
      : req.params.tipo=='M' ? '/home/tony/pipcg/pipcgimg/membrofoto' 
      : '/home/tony/pipcg/pipcgimg/niverdasemana')
  },
  filename: function (req, file, cb) {
      // Extração da extensão do arquivo original:
      var extensaoArquivo = path.extname(file.originalname)

      const novoNomeArquivo = req.params.nomearquivo

      // Indica o novo nome do arquivo:
      cb(null, `${novoNomeArquivo}.png`)

  }
});

const upload = multer({ storage });

app.post('/uploads/:nomearquivo/:tipo', upload.single('file'), async (req, res) => {

  // tipodeArquivo == 'M' (foto de membro) 'E' (imagem de Evento) 'A' (imagem de aniversariante da semana)
  try{
      return res.json(req.file.filename);
  }
  catch (err){
      return res.status(400).send({error: err})
  }
});

app.get('/imagens/:nomeArquivo/:tipo', (req, res) => {

  const nomeArquivo = req.params.nomeArquivo+'.png';
  const tipodeArquivo = req.params.tipo;
  let caminhoArquivo = '';

  // tipodeArquivo == 'M' (foto de membro) 'E' (imagem de Evento) 'A' (imagem de aniversariante da semana)
  if(tipodeArquivo=='M'){
    caminhoArquivo = `/home/tony/pipcg/pipcgimg/membrofoto/${nomeArquivo}`;
  }else if(tipodeArquivo=='E'){
    caminhoArquivo = `/home/tony/pipcg/pipcgimg/eventos/${nomeArquivo}`;
  }else if(tipodeArquivo=='A'){
    caminhoArquivo = `/home/tony/pipcg/pipcgimg/niverdasemana/${nomeArquivo}`;
  }else if(tipodeArquivo=='R'){
    caminhoArquivo = `/home/tony/pipcg/relatorio/${nomeArquivo}`;
  }

  fs.access(caminhoArquivo, fs.constants.F_OK, (err) => {
    if (err) {
      res.status(404).send('Imagem não encontrada');
    } else {
      res.sendFile(caminhoArquivo);
    }
  });
});

app.get('/listamembro/:nome', async (req, res) => {

  const nomeArquivo = req.params.nome;
  let caminhoArquivo = `/home/tony/pipcg/relatorio/${nomeArquivo}.pdf`

  try {
    await listaMembro(nomeArquivo);
    //console.log('PDF gerado com sucesso!');
    res.status(200).sendFile(caminhoArquivo);
  } catch (error) {
    //console.error('Erro ao gerar PDF:', error);
    res.status(500).send('Erro ao gerar PDF');
  }
});

app.get('/faixaetaria/:inicial/:final/:tipo/:nome', async (req, res) => {

  const inicial = req.params.inicial;
  const final = req.params.final;
  const tipo = req.params.tipo; // 1 = lista, 2 = ficha
  const nomeArquivo = req.params.nome;
  let caminhoArquivo = `/home/tony/pipcg/relatorio/${nomeArquivo}.pdf`

  try {
    await listafaixaetaria(inicial,final,tipo,nomeArquivo);
    //console.log('PDF gerado com sucesso!');
    res.status(200).sendFile(caminhoArquivo);
  } catch (error) {
    //console.error('Erro ao gerar PDF:', error);
    res.status(500).send('Erro ao gerar PDF');
  }
});

app.get('/fichamembro/:nome', async (req, res) => {

  const nomeArquivo = req.params.nome;
  let caminhoArquivo = `/home/tony/pipcg/relatorio/${nomeArquivo}.pdf`

  try {
    await fichaMembro(nomeArquivo);
    //console.log('PDF gerado com sucesso!');
    res.status(200).sendFile(caminhoArquivo);
  } catch (error) {
    //console.error('Erro ao gerar PDF:', error);
    res.status(500).send('Erro ao gerar PDF');
  }
});

// chatGpt
async function perguntar(pergunta) {

  var options = {
      'method': 'POST',
      'url': 'https://api.openai.com/v1/completions',
      'headers': {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        "model": "text-davinci-003",
        "prompt": pergunta,
        "max_tokens": 350,
        "temperature": 0.7
      })
    
    };
         
  request(options, function (error, response) {
  if (error) throw new Error(error);
  //return JSON.parse(response.body).choices[0].text.trim();
  console.log(JSON.parse(response.body).choices[0].text.trim());
  });

}