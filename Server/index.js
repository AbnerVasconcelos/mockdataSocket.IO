// server.js (com mock e logs funcionando)
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import http from "http";
import { Server } from "socket.io";
import { createClient } from "redis";

// SQLITE
import sequelize from "./config/database.js";
import Client from "./models/Client.js";
import Receita from "./models/Receitas.js";

// Rotas
import clientRoutes from "./routes/client.js";
import generalRoutes from "./routes/general.js";
import managementRoutes from "./routes/management.js";
import salesRoutes from "./routes/sales.js";
import receitasRoutes from "./routes/receitasRoutes.js";

dotenv.config();

// ================== CONFIG EXPRESS (API) ==================
const app = express();
const APP_PORT = Number(process.env.PORT || 5001);
const apiServer = http.createServer(app);

app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://192.168.196.45:3000",
  "http://192.168.196.100:3000",
  "http://192.168.196.33:3000",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Rotas REST
app.use("/client", clientRoutes);
app.use("/general", generalRoutes);
app.use("/management", managementRoutes);
app.use("/sales", salesRoutes);
app.use("/receitas", receitasRoutes);

// ================== CONFIG SOCKET.IO ==================
const SOCKET_PORT = Number(process.env.SOCKET_PORT || 5002);
const socketServer = http.createServer();
const io = new Server(socketServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ================== REDIS ==================
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => {
  console.error("[REDIS] Erro de conexão:", err);
});

process.on("unhandledRejection", (r) => console.error("[UNHANDLED REJECTION]", r));
process.on("uncaughtException", (e) => console.error("[UNCAUGHT EXCEPTION]", e));

// ================== MOCK DATA ==================
const ENABLE_MOCK =
  process.env.MOCK_DATA !== undefined ? process.env.MOCK_DATA === "1" : true; // por padrão LIGADO em dev
const BYPASS_REDIS_TO_SOCKET = process.env.BYPASS_REDIS_TO_SOCKET === "1"; // opcional: emite direto no socket também

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const randStep = (amp = 50) => Math.random() * amp * 2 - amp;
const randBool = (p = 0.5) => Math.random() < p;
const pad3 = (n) => String(n).padStart(3, "0");

const state = {
  three: {
    nivelA: 8000,
    nivelB: 9000,
    nivelC: 12000,
    nivelD: 7000,
    pesoBalanca: 3000,
    pesoMixer: 5000,
    percentualA: 25,
    percentualB: 35,
    percentualC: 10,
    percentualD: 30,
  },
  producao: {
    kgHoraProgramado: 120,
    kgHoraAtual: 95,
    espessuraProgramada: 25.0,
    espessuraAtual: 24.7,
    gramaturaAtual: 8.5,
    larguraProgramada: 1200,
    larguraAtual: 1185,
    puxadorProgramado: 45.5,
  },
  extrusoraRpm: 1450,
  puxadorMpm: 40.25,
  coils: {
    Extrusora: {
      extrusoraLigadoDesligado: true,
      extrusoraAutManEstado: true,
      extrusoraErro: false,
    },
    Puxador: {
      puxadorLigadoDesligado: true,
      puxadorAutManEstado: true,
      puxadorErro: false,
    },
    threeJs: {
      capacitivoA: false,
      capacitivoB: false,
      capacitivoC: false,
      capacitivoD: false,
      alimentandoA: false,
      alimentandoB: false,
      alimentandoC: false,
      alimentandoD: false,
      faltaMaterialA: false,
      faltaMaterialB: false,
      faltaMaterialC: false,
      faltaMaterialD: false,
      testeA: false,
      testeB: false,
      testeC: false,
      testeD: false,
    },
  },
};

function updateState() {
  state.three.nivelA = clamp(state.three.nivelA + randStep(120), 0, 20000);
  state.three.nivelB = clamp(state.three.nivelB + randStep(120), 0, 20000);
  state.three.nivelC = clamp(state.three.nivelC + randStep(120), 0, 20000);
  state.three.nivelD = clamp(state.three.nivelD + randStep(120), 0, 20000);
  state.three.pesoBalanca = clamp(state.three.pesoBalanca + randStep(200), 0, 20000);
  state.three.pesoMixer = clamp(state.three.pesoMixer + randStep(200), 0, 20000);

  const driftA = randStep(2), driftB = randStep(2), driftC = randStep(1.5), driftD = randStep(1.5);
  let A = clamp(state.three.percentualA + driftA, 0, 100);
  let B = clamp(state.three.percentualB + driftB, 0, 100 - A);
  let C = clamp(state.three.percentualC + driftC, 0, 100 - A - B);
  let D = clamp(100 - A - B - C, 0, 100);
  if (A + B + C + D === 0) { A = 25; B = 35; C = 10; D = 30; }
  state.three.percentualA = Math.round(A);
  state.three.percentualB = Math.round(B);
  state.three.percentualC = Math.round(C);
  state.three.percentualD = Math.round(D);

  state.producao.kgHoraAtual = clamp(state.producao.kgHoraAtual + randStep(1.8), 50, 150);
  state.producao.espessuraAtual = clamp(state.producao.espessuraAtual + randStep(0.12), 15, 40);
  state.producao.gramaturaAtual = clamp(state.producao.gramaturaAtual + randStep(0.08), 6, 12);
  state.producao.larguraAtual = clamp(state.producao.larguraAtual + randStep(4), 900, 2000);
  state.puxadorMpm = clamp(state.puxadorMpm + randStep(0.8), 0, 120);
  state.extrusoraRpm = clamp(state.extrusoraRpm + randStep(15), 0, 1745);

  if (randBool(0.02)) state.coils.threeJs.capacitivoA = randBool();
  if (randBool(0.02)) state.coils.threeJs.capacitivoB = randBool();
  if (randBool(0.02)) state.coils.threeJs.capacitivoC = randBool();
  if (randBool(0.02)) state.coils.threeJs.capacitivoD = randBool();
}

function buildPayload() {
  return {
    timestamp: Date.now(),
    registers: {
      producao: {
        kgHoraProgramado: Math.round(state.producao.kgHoraProgramado),
        kgHoraAtual: Math.round(state.producao.kgHoraAtual),
        espessuraProgramada: Number(state.producao.espessuraProgramada.toFixed(2)),
        espessuraAtual: Number(state.producao.espessuraAtual.toFixed(2)),
        gramaturaAtual: Number(state.producao.gramaturaAtual.toFixed(2)),
        larguraProgramada: Math.round(state.producao.larguraProgramada),
        larguraAtual: Math.round(state.producao.larguraAtual),
        puxadorProgramado: Number(state.producao.puxadorProgramado.toFixed(2)),
      },
      Puxador: { puxadorFeedBackSpeed: Number(state.puxadorMpm.toFixed(2)) },
      Extrusora: { extrusoraFeedBackSpeed: Math.round(state.extrusoraRpm) },
      threeJs: {
        nivelA: Math.round(state.three.nivelA),
        nivelB: Math.round(state.three.nivelB),
        nivelC: Math.round(state.three.nivelC),
        nivelD: Math.round(state.three.nivelD),
        pesoBalanca: Math.round(state.three.pesoBalanca),
        pesoMixer: Math.round(state.three.pesoMixer),
        percentualA: pad3(state.three.percentualA),
        percentualB: pad3(state.three.percentualB),
        percentualC: pad3(state.three.percentualC),
        percentualD: pad3(state.three.percentualD),
      },
      totalizadores: {
        totalizadorMetragem: Math.round((state.puxadorMpm / 60) * 200),
      },
    },
    coils: {
      Extrusora: { ...state.coils.Extrusora },
      Puxador: { ...state.coils.Puxador },
      threeJs: { ...state.coils.threeJs },
      dosador: { habilitaDosagem: randBool(0.1) },
      totalizadores: { ligaDesligaTotalizador: randBool(0.2) },
    },
  };
}

let mockInterval = null;
function startMock() {
  if (!ENABLE_MOCK) {
    console.log("[MOCK] Desativado (defina MOCK_DATA=1 para ativar).");
    return;
  }
  if (mockInterval) return;

  console.log("[MOOCK] Iniciando geração de dados (200 ms) em channel2…");
  mockInterval = setInterval(async () => {
    try {
      updateState();
      const payload = buildPayload();
      const msg = JSON.stringify(payload);

      const result = await redisClient.publish("channel2", msg);
      console.log(`[MOCK] Publicado no channel2 (receivers=${result}) | ts=${payload.timestamp} kgHora=${payload.registers.producao.kgHoraAtual} esp=${payload.registers.producao.espessuraAtual}`);

      if (BYPASS_REDIS_TO_SOCKET) {
        io.emit("read", msg);
        console.log("[MOCK] (Bypass) emitido no Socket.IO → 'read'");
      }
    } catch (err) {
      console.error("[MOCK] Erro ao publicar:", err);
    }
  }, 200);
}

function stopMock() {
  if (mockInterval) {
    clearInterval(mockInterval);
    mockInterval = null;
    console.log("[MOCK] Parado.");
  }
}

// ================== SOCKET.IO HANDLERS ==================
io.on("connection", (socket) => {
  console.log("###########################################");
  console.log(`[SOCKET] Usuário conectado: ${socket.id} from origin=${socket.request.headers.origin || "?"}`);

  socket.on("mensagem", (data) => {
    console.log("===========================================");
    console.log(`[SOCKET] 'mensagem' recebida do ${socket.id}: ${JSON.stringify(data)}`);
    console.log("===========================================");

    redisClient
      .publish("channel3", JSON.stringify(data))
      .then((result) => {
        console.log(`[REDIS] channel3 publish ok (receivers=${result})`);
      })
      .catch((err) => {
        console.error("[REDIS] Erro ao publicar no channel3:", err);
      });
  });

  socket.on("disconnect", (reason) => {
    console.log("-------------------------------------------");
    console.log(`[SOCKET] Usuário desconectado: ${socket.id} (reason=${reason})`);
    console.log("-------------------------------------------");
  });
});

// ================== BOOTSTRAP ASSÍNCRONO ==================
async function main() {
  try {
    console.log("[BOOT] Sincronizando SQLite…");
    await sequelize.sync({ force: true });
    console.log("[BOOT] SQLite ok.");

    apiServer.listen(APP_PORT, () => {
      console.log(`Servidor Express rodando na porta ${APP_PORT}`);
    });

    socketServer.listen(SOCKET_PORT, () => {
      console.log(`Servidor Socket.IO escutando na porta ${SOCKET_PORT}`);
    });

    console.log("[BOOT] Conectando Redis (publisher) …");
    await redisClient.connect();
    console.log("[REDIS] Conectado (publisher).");

    // Subscriber separado
    console.log("[BOOT] Conectando Redis (subscriber) …");
    const subscriber = redisClient.duplicate();
    await subscriber.connect();
    console.log("[REDIS] Subscriber conectado.");

    await subscriber.subscribe("channel2", (message) => {
      console.log("*******************************************");
      console.log(`[SUB] Mensagem recebida no channel2 (${Buffer.byteLength(message, "utf8")} bytes)`);
      // Log resumido para não poluir:
      try {
        const parsed = JSON.parse(message);
        console.log(`[SUB] ts=${parsed.timestamp} kgHora=${parsed.registers?.producao?.kgHoraAtual} puxador=${parsed.registers?.Puxador?.puxadorFeedBackSpeed}`);
      } catch {
        console.log(`[SUB] payload=`, message);
      }
      io.emit("read", message.toString());
      console.log("[SUB] Evento 'read' emitido para todos os sockets.");
      console.log("*******************************************");
    });

    // Inicia mock
    startMock();

    // Graceful shutdown
    process.on("SIGINT", async () => {
      console.log("\n[BOOT] SIGINT recebido. Encerrando…");
      stopMock();
      try { await subscriber.quit(); } catch {}
      try { await redisClient.quit(); } catch {}
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      console.log("\n[BOOT] SIGTERM recebido. Encerrando…");
      stopMock();
      try { await subscriber.quit(); } catch {}
      try { await redisClient.quit(); } catch {}
      process.exit(0);
    });
  } catch (err) {
    console.error("[BOOT] Falha ao inicializar:", err);
    process.exit(1);
  }
}

main();
