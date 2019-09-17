class ServicesCommAdapter {
  constructor(serviceName) {
    this.serviceName = serviceName;
    this.comm = new Promise((resolve, reject) => {
      this.connect = resolve;
    });
  }
}

module.exports = ServicesCommAdapter;
