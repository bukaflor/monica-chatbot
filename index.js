const { OpenAI } = require("openai");
const fs = require("fs");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const products = JSON.parse(fs.readFileSync("./products.json", "utf8"));

async function getRecommendation(message) {
  const prompt = `
Eres un asistente de una floristería. Sugiere un producto según el gusto del usuario. 
Productos disponibles:

${products.map(p => `- ${p.nombre}: ${p.descripcion}`).join("\n")}

Mensaje del cliente: "${message}"

Devuélveme solo el producto más adecuado en formato JSON así:
{
  "nombre": "...",
  "descripcion": "...",
  "imagen": "...",
  "precio": "..."
}
`;

  const chat = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Eres un experto en ventas de una tienda de flores." },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
  });

  const response = chat.choices[0].message.content;

  try {
    const result = JSON.parse(response);
    console.log("🎁 Recomendación:", result);
  } catch (error) {
    console.error("❌ No se pudo parsear la respuesta:", response);
  }
}

// Cambia este mensaje por el de tu cliente o visitante real
getRecommendation("Quiero un arreglo elegante con flores blancas para mi mamá");
