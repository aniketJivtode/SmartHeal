const SmartHeal = {
  init({ endpoint, projectId }) {
    this.endpoint = endpoint;
    this.projectId = projectId;

    this.intercept();
  },

  async send(payload) {
    try {
      await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          projectId: this.projectId,
        }),
      });
    } catch (e) {}
  },

  capture(error) {
    this.send({
      message: error?.message || error.toString(),
      stack: error?.stack,
      source: typeof window !== "undefined" ? "frontend" : "backend",
    });
  },

  intercept() {
    const originalError = console.error;

    console.error = (...args) => {
      this.capture(
        args[0] instanceof Error ? args[0] : new Error(args.join(" ")),
      );

      originalError(...args);
    };
  },
};

export default SmartHeal;
