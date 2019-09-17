const assert = require("assert");
const servicesComm = require("services-comm");
describe("unit", function() {
  describe("services-comm", function() {
    describe("#loadServices", function() {
      it("should load a single service", async function() {
        let inited = 0;
        let connected = 0;
        let assertedComm;
        await servicesComm.loadServices({
          dummy: {
            module: {
              initialize() {
                inited++;
              },
              connect(newComm) {
                connected++;
                assertedComm = newComm;
              }
            }
          }
        });

        assert.equal(inited, 1);
        assert.equal(connected, 1);
        assert.notEqual(assertedComm, undefined);
      });

      it("should init before connect", async function() {
        let counter = 0;
        let initOrder;
        let connectOrder;
        await servicesComm.loadServices({
          dummy: {
            module: {
              initialize() {
                initOrder = ++counter;
              },
              connect() {
                connectOrder = ++counter;
              }
            }
          }
        });

        assert.equal(initOrder, 1);
        assert.equal(connectOrder, 2);
      });
    });
  });
});
