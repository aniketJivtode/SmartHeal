import { runAgent } from "../agent/agent.js";
import { validatePatch } from "../guardrails/validate.js";
import { applyPatch } from "../executor/applyPatch.js";
import Job from "../models/Job.js";
export function startWatcher() {
  console.log("👀 Daemon started...");

  setInterval(async () => {
    const job = await Job.findOne({ status: "NEW" });

    if (!job) return;

    const jobId = job._id;

    try {
      await Job.findByIdAndUpdate(jobId, {
        status: "PROCESSING",
        $push: {
          timeline: { step: "Error detected", time: new Date() },
        },
      });

      let attempts = 0;
      let result = null;

      while (attempts < 2) {
        result = await runAgent(job.error);
        if (result?.confidence > 0.6) break;
        attempts++;
      }

      if (!result || result.confidence < 0.6) {
        await Job.findByIdAndUpdate(jobId, {
          agentResult: result,
          status: "FAILED",
          $push: {
            timeline: {
              step: "Rejected due to low confidence",
              time: new Date(),
            },
          },
        });
        return;
      }

      await Job.findByIdAndUpdate(jobId, {
        agentResult: result,
        $push: {
          timeline: { step: "Fix generated", time: new Date() },
        },
      });

      const validation = validatePatch(result.patch);

      if (!validation.valid) {
        await Job.findByIdAndUpdate(jobId, {
          status: "FAILED",
          agentResult: result,
          $push: {
            timeline: {
              step: "Guardrail failed",
              time: new Date(),
              reason: validation.reason,
            },
          },
        });
        return;
      }

      await Job.findByIdAndUpdate(jobId, {
        agentResult: result,
        $push: {
          timeline: { step: "Guardrail passed", time: new Date() },
        },
      });

      const execResult = applyPatch(result.patch);

      await Job.findByIdAndUpdate(jobId, {
        status: "DONE",
        agentResult: result,
        execution: execResult,
        $push: {
          timeline: { step: "Patch applied", time: new Date() },
        },
      });
    } catch (err) {
      console.error("Agent failed:", err);

      await Job.findByIdAndUpdate(jobId, {
        status: "FAILED",
        agentResult: result,
        $push: {
          timeline: {
            step: "Agent crashed",
            time: new Date(),
          },
        },
      });
    }
  }, 3000);
}
