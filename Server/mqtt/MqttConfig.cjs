const mqtt = require('mqtt');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env

const caFile = process.env.CA_FILE || './root-CA.crt';
const keyFile = process.env.KEY_FILE || './server.private.key';
const certFile = process.env.CERT_FILE || './server.cert.pem';
const clientId = process.env.CLIENT_ID || 'sdk-nodejs-v2';
const endpoint = process.env.ENDPOINT || 'a1ak097hgnw0bs-ats.iot.us-east-1.amazonaws.com';

const options = {
  ca: fs.readFileSync(caFile),
  key: fs.readFileSync(keyFile),
  cert: fs.readFileSync(certFile),
  clientId: clientId,
};

const client = mqtt.connect('mqtts://' + endpoint, options);

module.exports = { client };
