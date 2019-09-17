const rabbit = require("./rabbit");

module.exports = function proxify(comm) {
  return new Proxy(comm, {
    get(target, serviceName) {
      if (Reflect.has(target, serviceName)) {
        return target[serviceName];
      }
      return new Proxy(
        {},
        {
          get(_target, methodName) {
            return async function(...args) {
              await rabbit.callMethod(serviceName, methodName, ...args);
            };
          }
        }
      );
    }
  });
};
