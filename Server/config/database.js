import { Sequelize } from "sequelize";
import path from "path";
import { fileURLToPath } from "url";

// Ajustando o caminho para o SQLite
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "../database.sqlite"), // Define o arquivo do banco de dados
  logging: false, // Para evitar logs excessivos no console
});

// Teste de conexão
sequelize
  .authenticate()
  .then(() => console.log("Conectado ao banco de dados SQLite"))
  .catch((err) => console.error("Erro ao conectar ao SQLite:", err));

export default sequelize;
