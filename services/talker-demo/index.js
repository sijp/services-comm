const ServicesCommAdapter = require("services-comm-adapter");
const adapter = new ServicesCommAdapter("talker");

function connect(comm) {
  adapter.connect(comm);
}

function pickWord() {
  const words = ["Hello", "Hallo", "Guten Morgen"];
  return words[Math.floor(Math.random() * words.length)];
}

module.exports = {
  async talk($context, chattiness) {
    const comm = await adapter.comm;
    Array(chattiness)
      .fill("")
      .forEach(async () => {
        await new Promise(resolve => {
          setTimeout(() => {
            comm.echoService.echo(pickWord());
            resolve(true);
          }, 500);
        });
      });
  },
  connect
};
