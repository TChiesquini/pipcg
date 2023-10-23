import PDFDocument from 'pdfkit';
import fs from 'fs';

async function fichamembro(nomeArquivo) {

  const doc = new PDFDocument({size: 'A4'});
  const hoje = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

  const dadosFontSize = 12; 
  let linha = 85;

  const outputStream = fs.createWriteStream(`./relatorio/${nomeArquivo}.pdf`);

  const response = await fetch(`https://nova.monitor.eco.br:3006/membro/${nomeArquivo}`, {
    method: 'GET'
  });
  const membro = await response.json();

  doc.pipe(outputStream);

  // logo da igreja
  doc.image('pipcgimg/logo.png', 15, 15, {width: 40});

  // Nome do relatório
  doc
    .fontSize(14)
    .text('Ficha do Membro '+membro.nomecompleto, 70, 30);

  // data da geração
  doc
    .fontSize(8)
    .text(hoje, 520, 50, {width: 120});

  // linha de separação do título
  doc.moveTo(0, 60)                               
    .lineTo(620, 60)                           
    .stroke();             

  // impressão dos dados do relatório
  // primeira linha

  // foto do membro
  if (fs.existsSync(`pipcgimg/membrofoto/${nomeArquivo}.png`)) {
    doc.image(`pipcgimg/membrofoto/${nomeArquivo}.png`, 15, linha, {width: 120});
  }else{
    doc.image('pipcgimg/logo.png', 15, linha, {width: 120});
  }

  doc
    .fontSize(dadosFontSize)
    .text('Nome: '+membro.nomecompleto, 145, linha, {width: 250});

  linha += 15  
  // segunda linha    
  doc
    .fontSize(dadosFontSize)
    .text('Apelido: '+membro.nomereduzido, 145, linha, {width: 200});
  
  linha += 15 
  // quarta linha
  doc
    .fontSize(dadosFontSize)
    .text('Sexo: '+membro.sexo, 145, linha, {width: 100});
  
  linha += 15 
  // quarta linha    
  try{
    doc
    .fontSize(dadosFontSize)
    .text('Nascimento: '+membro.datanascimento.substring(8,10)+'/'+membro.datanascimento.substring(5,7)+'/'+membro.datanascimento.substring(0,4), 145, linha, {width: 150});
  }catch{
    doc
    .fontSize(dadosFontSize)
    .text('Nascimento: ', 145, linha, {width: 150});
  }
  
  linha += 15 
  // quinta linha
  
  doc
    .fontSize(dadosFontSize)
    .text('Email: '+membro.email, 145, linha, {width: 200});
  
  doc
    .fontSize(dadosFontSize)
    .text('Celular: '+membro.celular, 450, linha, {width: 200});

  linha += 15  
  // quarta linha    
  doc
    .fontSize(dadosFontSize)
    .text('Cidade Nasc.: '+membro.cidadenascimento, 145, linha, {width: 250});

  linha += 15  
  // quarta linha 
  doc
    .fontSize(dadosFontSize)
    .text('Nacionalidade: '+membro.nacionalidade, 145, linha, {width: 200});

  linha += 35 
  // sexta linha    
  doc
    .fontSize(dadosFontSize)
    .text('Estad. Civil: '+membro.estadocivil, 15, linha, {width: 250}); 

  linha += 15 
  // sexta linha    
  doc
    .fontSize(dadosFontSize)
    .text('Conjuge: '+membro.conjuge, 15, linha, {width: 250});

  try{
    doc
    .fontSize(dadosFontSize)
    .text('Data Casamento: '+membro.datacasamento.substring(8,10)+'/'+membro.datacasamento.substring(5,7)+'/'+membro.datacasamento.substring(0,4), 350, linha, {width: 250});
  }catch{
    doc
    .fontSize(dadosFontSize)
    .text('Data Casamento: ', 350, linha, {width: 250});
  }

  linha += 30 
  // sexta linha    
  doc
    .fontSize(dadosFontSize)
    .text('Identidade: '+membro.identidade, 15, linha, {width: 250});

  doc
    .fontSize(dadosFontSize)
    .text('CPF: '+membro.cpf, 350, linha, {width: 150});
      
  linha += 30  
  // segunda linha
  doc
    .fontSize(dadosFontSize)
    .text('Hierarquia: '+membro.hierarquia, 15, linha, {width: 250});
  
  doc
    .fontSize(dadosFontSize)
    .text('Reponsável: '+membro.pessoaresponsavel, 350, linha, {width: 250});

  linha += 15 
  // sexta linha    
  doc
    .fontSize(dadosFontSize)
    .text('Nome do Pai: '+membro.nomedopai, 15, linha, {width: 500});

  linha += 15 
  // sexta linha 
  doc
    .fontSize(dadosFontSize)
    .text('Nome da Mãe: '+membro.nomedamae, 15, linha, {width: 500});    
  
  linha += 30 
  // quarta linha
  doc
    .fontSize(dadosFontSize)
    .text('End.: '+membro.endereco, 15, linha, {width: 250});

  doc
    .fontSize(dadosFontSize)
    .text('Bairro: '+membro.bairro, 350, linha, {width: 150});

  linha += 30 
  // quinta linha
  doc
    .fontSize(dadosFontSize)
    .text('Município: '+membro.municipio, 15, linha, {width: 250});
  
  doc
    .fontSize(dadosFontSize)
    .text('UF: '+membro.uf, 350, linha, {width: 100});
  
  linha += 15 
  // quinta linha
  doc
    .fontSize(dadosFontSize)
    .text('CEP: '+membro.cep, 15, linha, {width: 100});

  linha += 15 
  // quinta linha
  doc
    .fontSize(dadosFontSize)
    .text('Referência: '+membro.pontodereferencia, 15, linha, {width: 500});

  linha += 30 
  // sexta linha
  try{
    doc
    .fontSize(dadosFontSize)
    .text('Membro desde: '+membro.datamembro.substring(8,10)+'/'+membro.datamembro.substring(5,7)+'/'+membro.datamembro.substring(0,4), 15, linha, {width: 250});
  }catch{
    doc
    .fontSize(dadosFontSize)
    .text('Membro desde: ', 15, linha, {width: 250});
  }
    
  doc
    .fontSize(dadosFontSize)
    .text('Aceitação: '+membro.formaentrada, 350, linha, {width: 150});

  linha += 30 
  // sexta linha    
  doc
    .fontSize(dadosFontSize)
    .text('Escolaridade: '+membro.nivelescolaridade, 15, linha, {width: 250}); 

  doc
    .fontSize(dadosFontSize)
    .text('Profissão: '+membro.profissao, 350, linha, {width: 150});

  linha += 30 
  // sexta linha    
  doc
    .fontSize(dadosFontSize)
    .text('Ocup. na Igreja: '+membro.cargonaigreja, 15, linha, {width: 250}); 
  
  // Fim do PDF      
  doc.end();

  return new Promise((resolve, reject) => {
    outputStream.on('finish', () => {
      resolve();
    });

    outputStream.on('error', (error) => {
      reject(error);
    });
  });
}

export default fichamembro;
