const amqp = require("amqplib");
const uuid4 = require("uuid/v4");

let channel;

module.exports = {
  async connect() {
    const rabbitConn = await amqp.connect("amqp://guest:guest@localhost", {});
    channel = await rabbitConn.createChannel();
  },

  defineMethod(serviceName, methodName, method) {
    const queueName = `${serviceName}.${methodName}`;
    console.log(`define method ${queueName}`);
    channel.assertQueue(queueName);
    channel.consume(queueName, msg => {
      const message = JSON.parse(msg.content.toString());
      const { args } = message;

      const result = method(...args);

      console.log("GOT RESULT", serviceName, methodName, result);
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
      console.log(`call method ${queueName}`);

      const correlationId = uuid4();

      const consumeTag = channel.consume(
        callbackQueue.queue,
        msg => {
          if (msg.properties.correlationId !== correlationId) return;
          try {
            const { result } = JSON.parse(msg.content.toString());

            setImmediate(() => channel.cancel(consumeTag));
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
