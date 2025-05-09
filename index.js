const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { OpenAI } = require('openai');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // asegúrate de tener esta variable en .env
});

const products = JSON.parse(fs.readFileSync('./src/products.json', 'utf8'));

app.post('/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Puedes volver a gpt-4 si sabes que está habilitado
      messages: [{ role: 'user', content: message }],
      temperature: 0.7
    });

    const response = completion.choices[0].message.content;

    // Si el mensaje incluye algo como "me gustan las flores amarillas", buscamos productos
    const sugerencias = products.filter(p =>
      (p.descripcion || '').toLowerCase().includes('amarilla')
    ).slice(0, 3); // Máximo 3 sugerencias

    res.json({ response, sugerencias });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Algo salió mal' });
  }
});

app.listen(3000, () => {
  console.log('Servidor en http://localhost:3000');
});
