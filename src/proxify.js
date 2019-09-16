module.exports = function proxify(comm, memo) {
  return new Proxy(comm, {
    get(target, serviceName) {
      if (Reflect.has(target, serviceName)) {
        return target[serviceName];
      }
      return new Proxy(
        {},
        {
          get(target, methodName) {
            return function(...args) {
              const otherComm = memo.find(
                c =>
                  Reflect.has(c, serviceName) &&
                  Reflect.has(c[serviceName], methodName)
              );
              return otherComm[serviceName][methodName](...args);
            };
          }
        }
      );
    }
  });
};
