//import {client} from './MqttConfig'
//import { publishMessage,
//            subscribeTopic,
//            receiveMessage, 
//            mqttConnection, 
//            errorConnectionMqtt } from './MqttFunctions'

const { client } = require('./MqttConfig.cjs');
const { publishMessage,
        subscribeTopic,
        receiveMessage, 
        mqttConnection, 
        errorConnectionMqtt } = require('./MqttFunctions.cjs');



message = {
  message: "Hello World",
  timesatamp: Date.now()
}



const topics = ["test/test/test", "sdk/test/python", "sdk/test/js"];


subscribeTopic(client, topics);

mqttConnection(client)
errorConnectionMqtt(client)
subscribeTopic(client, topics)
publishMessage(client, topics, message)
receiveMessage(client)

