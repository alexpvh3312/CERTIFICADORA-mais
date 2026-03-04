import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import cors from "cors";
import AdmZip from "adm-zip";

const CONFIG_FILE = path.resolve(process.cwd(), "config.json");

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Aumentar o limite para suportar vídeos em base64 no JSON
  app.use(express.json({ limit: '50mb' }));
  app.use(cors());

  // API para carregar a configuração
  app.get("/api/config", (req, res) => {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, "utf-8");
      res.json(JSON.parse(data));
    } else {
      res.json(null);
    }
  });

  // API para salvar a configuração
  app.post("/api/config", (req, res) => {
    try {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(req.body, null, 2));
      res.json({ success: true });
    } catch (error) {
      console.error("Erro ao salvar config:", error);
      res.status(500).json({ error: "Falha ao salvar configuração" });
    }
  });

  // API para baixar o projeto completo
  app.get("/api/download-project", (req, res) => {
    try {
      const zip = new AdmZip();
      const rootDir = process.cwd();
      
      const files = fs.readdirSync(rootDir);
      
      files.forEach(file => {
        const fullPath = path.join(rootDir, file);
        const stats = fs.statSync(fullPath);
        
        // Ignorar pastas pesadas ou desnecessárias
        if (file === 'node_modules' || file === 'dist' || file === '.git' || file === '.next') {
          return;
        }
        
        if (stats.isDirectory()) {
          zip.addLocalFolder(fullPath, file);
        } else {
          zip.addLocalFile(fullPath);
        }
      });
      
      const zipBuffer = zip.toBuffer();
      
      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename=projeto-apsilva.zip',
        'Content-Length': zipBuffer.length
      });
      
      res.send(zipBuffer);
    } catch (error) {
      console.error("Erro ao gerar ZIP:", error);
      res.status(500).send("Erro ao gerar arquivo de download");
    }
  });

  // Vite middleware para desenvolvimento
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Em produção, servir arquivos estáticos da pasta dist
    app.use(express.static(path.resolve(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(process.cwd(), "dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
  });
}

startServer();
