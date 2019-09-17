const proxify = require("./proxify");
const rabbit = require("./rabbit");

module.exports = {
  async loadServices(services) {
    await rabbit.connect();
    const comm = Object.entries(services).reduce((commMemo, entry) => {
      const [serviceName, service] = entry;
      return {
        ...commMemo,
        [serviceName]:
          service.module.initialize(service.params || {}) || service.module
      };
    }, {});

    Object.entries(services).forEach(serviceEntry => {
      const [serviceName, service] = serviceEntry;
      Object.entries(service.module).forEach(methodEntry => {
        const [methodName, method] = methodEntry;
        rabbit.defineMethod(serviceName, methodName, method);
      });
    });

    Object.keys(services).forEach(serviceName =>
      comm[serviceName].connect(proxify(comm))
    );

    return comm;
  },
  disconnect() {
    rabbit.disconnect();
  }
};
