import request from 'request';
import {} from 'dotenv/config'

const apiKey = process.env.OPENAI_API_KEY;

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

perguntar("Me apresente um versículo bíblico (versão da bíblia NVI) que transmita paz e, me apresente a resposta em formato json, separando o versículo, a referência bíblia e a explicação. Somente o JSON")
