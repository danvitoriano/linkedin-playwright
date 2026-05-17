import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = __dirname;

const envPath = path.join(root, ".env");
const envExamplePath = path.join(root, ".env.example");

function main() {
  console.log("\nlinkedin-playwright — configuração inicial\n");

  if (!fs.existsSync(envPath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log("✓ Criado .env a partir de .env.example");
  } else {
    console.log("• .env já existe (mantido)");
  }

  console.log(`
Próximos passos:

  1. Edite message.ts com sua mensagem de boas-vindas
     e defina MESSAGE_CONFIGURED = true

  2. npm run login
     (faça login na sua conta LinkedIn no navegador)

  3. npm run run
     (aceita convites e envia as mensagens)

Opcional: ajuste MAX_INVITES e DELAY_MS no arquivo .env

Alternativa: use PROMPT.md no Cursor ou Claude Code para recriar o projeto do zero.
`);
}

main();
