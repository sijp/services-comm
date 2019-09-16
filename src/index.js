const proxify = require("./proxify");

const memo = [];

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
      comm[serviceName].connect(proxify(comm, memo))
    );

    memo.push(comm);

    return comm;
  }
};
