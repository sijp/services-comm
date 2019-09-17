const assert = require("assert");

describe("integration", function() {
  describe("services-comm", function() {
    it("should communicate between to comms on the same process", async function() {
      delete require.cache[require.resolve("services-comm")];
      const servicesComm1 = require("services-comm");
      delete require.cache[require.resolve("services-comm")];
      const servicesComm2 = require("services-comm");

      let comm1;
      const expectedValue = "test";

      let realValue;

      const c1 = await servicesComm1.loadServices({
        service1: {
          module: {
            initialize() {},
            connect(comm) {
              comm1 = comm;
            },
            async sendValue(value) {
              const s2 = (await comm1).service2;
              await s2.echo(value);
            }
          }
        }
      });

      await servicesComm2.loadServices({
        service2: {
          module: {
            initialize() {},
            connect() {},
            echo(value) {
              return (realValue = value);
            }
          }
        }
      });
      await c1.service1.sendValue(expectedValue);

      assert.equal(expectedValue, realValue);
    });
  });
});
