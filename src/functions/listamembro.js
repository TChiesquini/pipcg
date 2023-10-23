import PDFDocument from 'pdfkit';
import fs from 'fs';

async function listaMembro(nomeArquivo) {

  const doc = new PDFDocument({size: 'A4'});
  const hoje = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  const degrau = 15;
  let linha = 85;

  const outputStream = fs.createWriteStream(`./relatorio/${nomeArquivo}.pdf`);

  const response = await fetch('https://nova.monitor.eco.br:3006/membro', {
    method: 'GET'
  });
  const dados = await response.json();

  doc.pipe(outputStream);

  // logo da igreja
  doc.image('pipcgimg/logo.png', 15, 15, {width: 40});

  // Nome do relatório
  doc
    .fontSize(14)
    .text('Lista de Membros', 70, 30);

  // data da geração
  doc
    .fontSize(8)
    .text(hoje, 520, 50, {width: 120});

  // linha de separação do título
  doc.moveTo(0, 60)                               
    .lineTo(620, 60)                           
    .stroke();             

  // cabeçalho das colunas
  doc
    .fontSize(12)
    .text('Nome', 20, 65, {width: 120});

  doc
    .fontSize(12)
    .text('e-mail', 300, 65, {width: 120});

  doc
    .fontSize(12)
    .text('Telefone', 500, 65, {width: 120});

  // linha de separação do cabeçalho
  doc.moveTo(0, 80)                               
    .lineTo(620, 80)                           
    .stroke(); 

  // impressão dos dados do relatório
  dados.forEach(membro => {
    doc
      .fontSize(10)
      .text(membro.nomecompleto, 20, linha, {width: 250});

    doc
      .fontSize(10)
      .text(membro.email, 300, linha, {width: 200});

    doc
      .fontSize(10)
      .text(membro.celular, 500, linha, {width: 100});
    
    if (linha > 730){
      linha = 85
      doc.addPage({size: 'A4'})

      // logo da igreja
      doc.image('pipcgimg/logo.png', 15, 15, {width: 40});

      // Nome do relatório
      doc
        .fontSize(14)
        .text('Lista de Membros', 70, 30);

      // data da geração
      doc
        .fontSize(8)
        .text(hoje, 520, 50, {width: 120});

      // linha de separação do título
      doc.moveTo(0, 60)                               
        .lineTo(620, 60)                           
        .stroke();             

      // cabeçalho das colunas
      doc
        .fontSize(12)
        .text('Nome', 20, 65, {width: 120});

      doc
        .fontSize(12)
        .text('e-mail', 300, 65, {width: 120});

      doc
        .fontSize(12)
        .text('Telefone', 500, 65, {width: 120});

      // linha de separação do cabeçalho
      doc.moveTo(0, 80)                               
        .lineTo(620, 80)                           
        .stroke(); 
    }else{
      linha += degrau;
    }
   
  });

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

export default listaMembro;
