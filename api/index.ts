import express from 'express';
import serverless from 'serverless-http';

// Cria uma aplicação Express
const app = express();

// Define uma rota que responde a tudo com uma mensagem de sucesso
app.use((req, res, next) => {
  // Adiciona um log para sabermos que a função foi invocada
  console.log(`[DEBUG] Rota de teste acessada: ${req.url}`);
  
  // Retorna uma resposta JSON simples
  res.status(200).json({ message: "Servidor de teste está no ar. O problema está na inicialização do NestJS." });
});

// Exporta o handler para a Vercel
export default serverless(app);

