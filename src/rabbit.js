const amqp = require("amqplib");
const uuid4 = require("uuid/v4");
let rabbitConn;
let channel;

let connected = false;
let disconnecting = false;

module.exports = {
  async connect() {
    if (connected) return;
    connected = true;
    rabbitConn = await amqp.connect("amqp://guest:guest@localhost", {});
    channel = await rabbitConn.createChannel();
  },

  async disconnect() {
    if (disconnecting === true) return false;
    disconnecting = true;
    return new Promise(resolve => {
      setTimeout(() => resolve(rabbitConn.close()), 500);
    });
  },

  defineMethod(serviceName, methodName, method) {
    const queueName = `${serviceName}.${methodName}`;
    channel.assertQueue(queueName);
    channel.consume(queueName, msg => {
      const message = JSON.parse(msg.content.toString());
      const { args } = message;

      const result = method(...args);

      channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify({ result })),
        {
          correlationId: msg.properties.correlationId
        }
      );
      channel.ack(msg);
      return result;
    });
  },

  async callMethod(serviceName, methodName, ...args) {
    const callbackQueue = await channel.assertQueue("", {
      exclusive: true
    });
    return new Promise((resolve, reject) => {
      const queueName = `${serviceName}.${methodName}`;

      const correlationId = uuid4();

      const consumeTag = channel.consume(
        callbackQueue.queue,
        msg => {
          if (msg.properties.correlationId !== correlationId) return;
          try {
            const { result } = JSON.parse(msg.content.toString());

            setImmediate(async () => {
              const { consumerTag } = await consumeTag;
              channel.cancel(consumerTag);
            });
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
        {
          noAck: true
        }
      );

      channel.sendToQueue(queueName, Buffer.from(JSON.stringify({ args })), {
        correlationId: correlationId,
        replyTo: callbackQueue.queue
      });
    });
  }
};
