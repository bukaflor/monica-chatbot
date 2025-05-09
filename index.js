// index.js para Render con inteligencia conversacional
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { OpenAI } = require('openai');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const productos = JSON.parse(fs.readFileSync('./products.json', 'utf8'));

const COLORES = ['amarillo', 'rojo', 'rosa', 'blanco', 'azul', 'naranja'];
const OCASIONES = ['mamá', 'novia', 'cumpleaños', 'aniversario', 'papá'];

app.post('/chat', async (req, res) => {
  const { message } = req.body;
  const lower = message.toLowerCase();
  const hayColor = COLORES.find(c => lower.includes(c));
  const hayOcas = OCASIONES.find(o => lower.includes(o));

  let sugerencias = [];
  let respuesta = '';

  if (hayColor || hayOcas) {
    // Buscar productos por coincidencia de color
    sugerencias = productos.filter(p => p.descripcion?.toLowerCase().includes(hayColor))
                           .slice(0, 3)
                           .map(p => ({ url: p.url, imagen: p.imagen }));

    respuesta = `Perfecto, te muestro algunas opciones ideales${hayColor ? ' para ese color' : ''}${hayOcas ? ' y ocasión' : ''} 🎁`;
  } else {
    respuesta = 'Cuéntame, ¿para quién es el regalo? ¿Y qué colores le gustan?';
  }

  try {
    const ai = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Eres una experta florista que sugiere obsequios personalizados.' },
        { role: 'user', content: message }
      ],
      temperature: 0.7
    });

    const idea = ai.choices[0].message.content;
    res.json({ response: idea + '\n\n' + respuesta, sugerencias });
  } catch (error) {
    console.error(error);
    res.status(500).json({ response: 'Lo siento, hubo un error 😓', sugerencias: [] });
  }
});

app.listen(3000, () => console.log('Servidor activo en puerto 3000'));
