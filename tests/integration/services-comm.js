const assert = require("assert");
const servicesComm = require("services-comm");

describe("integration", () => {
  describe("services-comm", () => {
    it("should communicate between to comms", async () => {
      let comm1;
      const expectedValue = "test";

      let realValue;

      const c1 = servicesComm.loadServices({
        service1: {
          module: {
            initialize() {},
            connect(comm) {
              comm1 = comm;
            },
            async sendValue(value) {
              const s2 = (await comm1).service2;
              s2.echo(value);
            }
          }
        }
      });

      servicesComm.loadServices({
        service2: {
          module: {
            initialize() {},
            connect() {},
            echo(value) {
              realValue = value;
            }
          }
        }
      });
      await c1.service1.sendValue(expectedValue);

      assert.equal(expectedValue, realValue);
    });
  });
});
