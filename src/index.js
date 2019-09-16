const proxify = require("./proxify");

module.exports = {
  loadServices(services) {
    const comm = Object.entries(services).reduce((commMemo, entry) => {
      const [serviceName, service] = entry;
      return {
        ...commMemo,
        [serviceName]:
          service.module.initialize(service.params || {}) || service.module
      };
    }, {});

    Object.keys(services).forEach(serviceName =>
      comm[serviceName].connect(proxify(comm))
    );

    return comm;
  }
};
