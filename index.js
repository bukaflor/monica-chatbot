const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const productos = JSON.parse(fs.readFileSync(path.join(__dirname, 'products.json')));

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY
}));

const memoriaConversaciones = {};

function getInicioConversacion() {
  return [
    {
      role: 'system',
      content: `Eres Mónica, una asesora virtual experta en regalos florales de bukaflor.com.co.
Hablas con calidez y guías paso a paso: ¿Para quién es el regalo?, ¿ocasión?, ¿gustos o colores?, ¿tipo de regalo?.
Sugiere productos reales si puedes. Ejemplo:
- Ramo Rosas Rojas: https://bukaflor.com.co/products/ramo-rosas-rojas
- Bombon Amarillo: https://bukaflor.com.co/products/bombon-amarillo
- Jarron Rosa Daniela: https://bukaflor.com.co/products/jarron-rosa-daniela`
    }
  ];
}

app.post('/chat', async (req, res) => {
  const { message, sessionId } = req.body;
  if (!message || !sessionId) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  if (!memoriaConversaciones[sessionId]) {
    memoriaConversaciones[sessionId] = getInicioConversacion();
  }

  memoriaConversaciones[sessionId].push({ role: 'user', content: message });

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: memoriaConversaciones[sessionId],
      temperature: 0.8
    });

    const respuesta = completion.data.choices[0].message.content;
    memoriaConversaciones[sessionId].push({ role: 'assistant', content: respuesta });
    res.json({ reply: respuesta });
  } catch (err) {
    console.error('Error OpenAI:', err.response?.data || err.message);
    res.status(500).json({ error: 'Fallo al generar respuesta' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🤖 Mónica Chatbot backend activo en http://localhost:${PORT}`);
});
