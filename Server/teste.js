import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import http from 'http'; //socket
import { Server } from "socket.io";//socket
import mqtt from 'mqtt';
import fs from 'fs'

import clientRoutes from "./routes/client.js";
import generalRoutes from "./routes/general.js";
import managementRoutes from "./routes/management.js";
import salesRoutes from "./routes/sales.js";

//MQTT imports
import {
  publishMessage,
  subscribeTopic,
  receiveMessage,
  mqttConnection,
  errorConnectionMqtt,
  subscribeTopics
} from './mqtt/MqttFunctions.cjs';


// data imports
import User from "./models/User.js";
import Product from "./models/Product.js";
import ProductStat from "./models/ProductStat.js";
import Transaction from "./models/Transaction.js";
import OverallStat from "./models/OverallStat.js";
import AffiliateStat from "./models/AffiliateStat.js";
import Topic from "./models/Topic.js";
import {
  dataUser,
  dataProduct,
  dataProductStat,
  dataTransaction,
  dataOverallStat,
  dataAffiliateStat,
  dataTopics,
} from "./data/index.js";


/* CONFIGURATION */
dotenv.config();
const app = express();
const server = http.createServer(app);


app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

/* ROUTES */
app.use("/client", clientRoutes);
app.use("/general", generalRoutes);
app.use("/management", managementRoutes);
app.use("/sales", salesRoutes);

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 9000;
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));

    /* ONLY ADD DATA ONE TIME */
    //AffiliateStat.insertMany(dataAffiliateStat);
    //OverallStat.insertMany(dataOverallStat);
    //Product.insertMany(dataProduct);
    //ProductStat.insertMany(dataProductStat);
    //Transaction.insertMany(dataTransaction);
    //User.insertMany(dataUser);
    //Topic.insertMany(dataTopics)
  })
  .catch((error) => console.log(`${error} did not connect`));

  /* MQTT SETUP */
const clientId = process.env.CLIENT_ID || 'sdk-nodejs-v2';
const endpoint = process.env.ENDPOINT || 'a1ak097hgnw0bs-ats.iot.us-east-1.amazonaws.com';
const options = {
  ca: fs.readFileSync(process.env.CA_FILE),
  key: fs.readFileSync(process.env.KEY_FILE ),
  cert: fs.readFileSync(process.env.CERT_FILE),
  clientId: clientId,
};
//const topics = ["test/test/test", "sdk/test/python", "sdk/test/js"];
const client = mqtt.connect('mqtts://' + endpoint, options);
mqttConnection(client)
errorConnectionMqtt(client)

//subscribeTopics(client, topics)
//subscribeTopic(client, topics)
//publishMessage(client, topics, message)
//receiveMessage(client)

  function findTopicByEmail(email) {
    return new Promise((resolve, reject) => {
      Topic.findOne({ email: email }, function(err, result) {
        if (err) {
          reject(err);
        } else {
          const topic = result && result.topic ? result.topic : "test/test/test";
          resolve(topic);
        }
      });
    });
  }

  

  function findSocketIdsByTopic(topic) {
    const socketIds = [];
    for (let id in users) {
      if (users[id].topic.includes(topic)) {
        socketIds.push(id); // Adiciona todos os IDs que correspondem ao tópico
      }
    }
    return socketIds;
  }
  
  
  

  function findSocketEvent(topic) {
    const regex = /\/(.*?)\//;
    const match = topic.match(regex);
  
    if (match && match.length >= 2) {
      return match[1];
    }
  
    return null; // Caso não seja encontrada nenhuma correspondência
  }

  



  const users = {};

  // Defina o listener para o evento 'message' fora do evento 'connection'
  // topicos apenas para leitura. Dados modbus
  client.on('message', (topic, message) => {
    console.log("*********************************************************");
    console.log('@@@ MQTT => Browser @@@ Nova informação recebida no tópico', topic);
    console.log('@@@ MQTT => Browser @@@ Conteúdo da mensagem:', message.toString(), typeof message);
  
    let socketIds = findSocketIdsByTopic(topic); 
    let socketEvent = findSocketEvent(topic);
  
    if(socketEvent && socketIds.length > 0){
      socketIds.forEach(socketId => {
        io.to(socketId).emit(socketEvent, message.toString());
        console.log(`@@@ MQTT => Browser @@@  Evento "${socketEvent}" acionado para socketId "${socketId}"` );
      });
      console.log("*********************************************************");
    } else {
      console.log("Nenhum socket correspondente ao tópico ou evento encontrado.");
    }
  });
  
  
  io.on("connection", (socket) => {
    console.log("###################################################");
    console.log(`### Usuário conectado: ${socket.id}###`);
  
    socket.on("user", async (data) => {
      let email = data.email;
      try {
        let topic = await findTopicByEmail(email); // Aguarda a resolução da Promessa
        await subscribeTopics(client, topic);
    
        users[socket.id] = {
          email: email,
          topic: topic,
          socketId: socket.id
        };
      let state = {
        "connected": true,
        "timestamp": new Date().toISOString()
      }
        publishMessage(client, topic[0], state)
        console.log(`### Obj Email de login : ${users[socket.id].email}`);
        console.log(`### Obj Topic for user : ${users[socket.id].topic}`);
        console.log(`### Obj Id do objeto : ${users[socket.id].socketId}`);
        console.log("###################################################");
      } catch (err) {
        console.error(err);
      }
    });
    
  
    socket.on("mensagem", (data) => {  //Recebe mensagem e aciona publish MQTT
      if(socket.id in users){
      const { email, topic, socketId } = users[socket.id];
      console.log("*********************************************************");
      console.log("@@@ MQTT <= SOCKET @@@ Parâmetros do socket:", email, topic, socketId);
      console.log("@@@ MQTT <= SOCKET @@@ Dados recebidos do navegador:", data);
      publishMessage(client, topic[1], data);
    }else {
      console.log("O usuário não está conectado.");
    }
    });
  
    socket.on("disconnect", () => {
      console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
      console.log(`XXXX Usuário desconectado XXXX: ${socket.id}`);
      
      // Verifica se a chave socket.id existe em users
      if (socket.id in users) {
        const { topic } = users[socket.id];
        if (topic) {
        let state = {
            "connected": false,
            "timestamp": new Date().toISOString()
          }
          publishMessage(client, topic[0], state)
          client.unsubscribe(topic, (err) => {
            if (err) {
              console.error("!!!!!! Erro ao cancelar a inscrição do tópico:", err);
            } else {
              console.log("XXXX Inscrição do tópico cancelada:", topic);
              console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
            }
          });
        }
        delete users[socket.id];
      } else {
        // Caso socket.id não exista em users, faça algo apropriado aqui
        console.log("O usuário desconectado não estava registrado.");
        console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
      }
    });
    
  });


     /*SOCKET.IO SETUP */
  const SOCKET_PORT = process.env.SOCKET_PORT || 3000;
  server.listen(SOCKET_PORT, () => {
    console.log(`Servidor Socket.IO escutando na porta ${SOCKET_PORT}`);
  });

  
  console.log("### Estado atual do objeto users: ", users);