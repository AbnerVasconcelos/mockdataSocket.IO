/**
 * Funções relacionadas à comunicação MQTT
 */

/**
 * Estabelece a conexão com o broker MQTT.
 *
 * @param {Object} client - Objeto MQTT client para estabelecer a conexão.
 */
function mqttConnection(client) {
    client.on('connect', () => {
      console.log('### Conexão estabelecida com o broker MQTT.');
    });
  }
  
  /**
   * Lida com erros de conexão MQTT.
   *
   * @param {Object} client - Objeto MQTT client para lidar com erros de conexão.
   */
  function errorConnectionMqtt(client) {
    client.on('error', (error) => {
      console.error('!!!! Erro na conexão:', error);
    });
  }
  
  /**
   * Inscreve-se em vários tópicos MQTT.
   *
   * @param {Object} client - Objeto MQTT client para realizar a inscrição.
   * @param {Array} topics - Array de strings contendo os tópicos a serem inscritos.
   */
  /*function subscribeTopics(client, topics) {
    topics.forEach((topic) => {
      client.subscribe(topic, (err) => {
        if (err) {
          console.error('!!!!Erro ao se inscrever no tópico:', topic, err);
        } else {
          console.log('### Inscrição realizada no tópico:', topic);
        }
      });
    });
  }*/
  function subscribeTopics(client, topics) {
    const subscribePromises = topics.map((topic) => {
      return new Promise((resolve, reject) => {
        client.subscribe(topic, (err) => {
          if (err) {
            console.error('!!!!Erro ao se inscrever no tópico:', topic, err);
            reject(err);
          } else {
            console.log('### Inscrição realizada no tópico:', topic);
            resolve(topic);
          }
        });
      });
    });
  
    return Promise.all(subscribePromises);
  }
  

function subscribeTopic(client, topic){
  client.subscribe(topic, (err) => {
    if (err) {
      console.error('!!!!! Erro ao se inscrever no tópico:', topic, err);
    } else {
      console.log('###  Inscrição realizada no tópico:', topic);
    }
  });
}



  
  /**
   * Manipula a recepção de mensagens MQTT.
   *
   * @param {Object} client - Objeto MQTT client para receber as mensagens.
   */
  function receiveMessage(client) {
    // Após receber uma mensagem MQTT, aciona evento socket
    client.on('message', (topic, message) => {
      console.log('@@@ MQTT => SOCKET @@@ Nova informação recebida no tópico', topic);
      console.log('@@@ MQTT => SOCKET @@@ Mensagem:', message.toString());
    });
  }
  
  /**
   * Encontra o ID do socket com base no tópico.
   *
   * @param {string} topic - Tópico MQTT para buscar o ID do socket.
   * @param {Object} users - Objeto contendo informações dos usuários e seus tópicos.
   * @returns {string|null} - ID do socket correspondente ao tópico, ou null se não encontrado.
   */
  function findSocketIdByTopic(topic, users) {
    for (let id in users) {
      if (users[id].topic === topic) {
        return id;
      }
    }
    return null;
  }
  
  /**
   * Encaminha mensagens MQTT para o socket correspondente.
   *
   * @param {Object} client - Objeto MQTT client para encaminhar as mensagens.
   * @param {Object} io - Objeto do socket.io para enviar as mensagens para o socket correspondente.
   * @param {Object} users - Objeto contendo informações dos usuários e seus tópicos.
   */
  function mqttToSocket(client, io, users) {
    client.on('message', (topic, message) => {
      console.log('Nova informação recebida no tópico', topic);
      console.log('Mensagem:', message.toString());
      let socketId = findSocketIdByTopic(topic, users);
      if (socketId) {
        io.to(socketId).emit("receive_message", message);
      }
    });
  }
  
  /**
   * Publica uma mensagem MQTT em um tópico específico.
   *
   * @param {Object} client - Objeto MQTT client para publicar a mensagem.
   * @param {string} topic - Tópico MQTT no qual a mensagem será publicada.
   * @param {Object} message - Mensagem a ser publicada, deve ser um objeto JSON.
   */
  function publishMessage(client, topic, message) {
    client.publish(topic, JSON.stringify(message));
    console.log('@@@ MQTT <= SOCKET @@@ Publicando no Broker :', message);
    console.log("*********************************************************");
    
  }
  
  module.exports=   {
    publishMessage,
    subscribeTopic, 
    receiveMessage,
    mqttConnection,
    errorConnectionMqtt,
    subscribeTopics
  };
  