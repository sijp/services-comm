module.exports = function proxify(comm) {
  return new Proxy(comm, {
    get(target, property) {
      if (Reflect.has(target, property)) {
        return target.property;
      }
      return new Proxy(
        {},
        {
          get(target, property) {
            return function() {
              throw "Not implemented!";
            };
          }
        }
      );
    }
  });
};
