import { runAgent } from "../agent/agent.js";

export function startWatcher() {
  console.log("👀 Daemon started...");

  setInterval(async () => {
    const job = global.currentJob;

    if (!job || job.status !== "NEW") return;

    job.status = "PROCESSING";

    job.timeline.push({
      step: "Error detected",
      time: new Date(),
    });

    job.timeline.push({
      step: "Agent invoked",
      time: new Date(),
    });

    let attempts = 0;
    let result = null;

    try {
      while (attempts < 2) {
        result = await runAgent(job.error);

        if (result?.confidence > 0.6) break;

        attempts++;
      }

      if (!result || result.confidence < 0.6) {
        job.timeline.push({
          step: "Rejected due to low confidence",
          time: new Date(),
        });

        job.status = "FAILED";
        return;
      }

      job.agentResult = result;

      job.timeline.push({
        step: "Fix generated",
        time: new Date(),
      });

      job.status = "DONE";
    } catch (err) {
      console.error("Agent failed:", err);

      job.timeline.push({
        step: "Agent crashed",
        time: new Date(),
      });

      job.status = "FAILED";
    }
  }, 3000);
}
