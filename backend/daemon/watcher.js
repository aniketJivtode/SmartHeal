import { runAgent } from "../agent/agent.js";
import { validatePatch } from "../guardrails/validate.js";
import { applyPatch } from "../executor/applyPatch.js";
import Job from "../models/Job.js";
import Repo from "../models/Repo.js";
import { createPR } from "../services/githubService.js";
import { sendAlert } from "../services/alertService.js";

/**
 * 📡 Stub realtime emitter (replace with socket.io later)
 */
function emitJobUpdate(job) {
  // no-op for now
}

export function startWatcher() {
  console.log("👀 Daemon started...");

  setInterval(async () => {
    let job;

    try {
      // 🔥 atomic pick + lock
      job = await Job.findOneAndUpdate(
        { status: "NEW" },
        { status: "PROCESSING" },
        { returnDocument: "after", sort: { createdAt: 1 } },
      );

      if (!job) return;

      const jobId = job._id;

      // unified updater (also emits realtime)
      const updateJob = async (update) => {
        const updated = await Job.findByIdAndUpdate(jobId, update, {
          returnDocument: "after",
        });
        emitJobUpdate(updated);
        return updated;
      };

      await updateJob({
        $push: {
          timeline: { step: "Processing started", time: new Date() },
        },
      });

      // 🔁 retry logic with visibility
      let result;
      let attempts = 0;

      for (let attempt = 0; attempt < 2; attempt++) {
        attempts++;
        result = await runAgent(job.error);
        if (result?.confidence > 0.6) break;
      }
      console.log("result", result);
      await updateJob({
        $push: {
          timeline: {
            step: `Agent attempted ${attempts} times`,
            time: new Date(),
          },
        },
      });

      // ❌ rejected (very low confidence)
      if (!result || result.confidence < 0.5) {
        await updateJob({
          status: "FAILED",
          agentResult: result,
          decision: "REJECTED",
          $push: {
            timeline: {
              step: "Rejected (low confidence)",
              time: new Date(),
            },
          },
        });

        await sendAlert(`❌ Job rejected: ${job.error}`, job);
        return;
      }

      // ⚠️ manual review
      if (result.confidence < 0.85) {
        await updateJob({
          status: "AWAITING_APPROVAL",
          agentResult: result,
          decision: "MANUAL",
          $push: {
            timeline: {
              step: "Needs manual approval",
              time: new Date(),
            },
          },
        });

        await sendAlert(`⚠️ Needs approval: ${job.error}`, job);
        return;
      }

      // ✅ high confidence → continue
      await updateJob({
        agentResult: result,
        decision: "AUTO",
        $push: {
          timeline: { step: "Fix generated", time: new Date() },
        },
      });

      // 🔒 guardrails
      // const validation = validatePatch(result.patch);

      // if (!validation.valid) {
      //   await updateJob({
      //     status: "FAILED",
      //     agentResult: result,
      //     $push: {
      //       timeline: {
      //         step: "Guardrail failed",
      //         time: new Date(),
      //         reason: validation.reason,
      //       },
      //     },
      //   });

      //   await sendAlert(`🚨 Guardrail failed: ${job.error}`);
      //   return;
      // }

      await updateJob({
        $push: {
          timeline: { step: "Guardrail passed", time: new Date() },
        },
      });

      // ⚙️ safe execution
      let execResult;

      try {
        //execResult = await applyPatch(result.patch);
        const repo = await Repo.findOne({ projectId: job.projectId });

        let prUrl = null;
        console.log("repo found:", repo ? "yes" : "no");
        if (repo) {
          try {
            prUrl = await createPR({
              repo,
              patch: result.patch,
            });

            console.log("✅ PR created:", prUrl);

            await updateJob({
              prUrl,
              $push: {
                timeline: {
                  step: "PR created",
                  time: new Date(),
                  reason: prUrl,
                },
              },
            });
          } catch (err) {
            console.error("PR ERROR FULL:", {
              status: err.response?.status,
              data: err.response?.data,
              message: err.message,
            });

            // Update job with detailed error information
            await updateJob({
              $push: {
                timeline: {
                  step: "PR creation failed",
                  time: new Date(),
                  reason: err.message,
                },
              },
            });

            // Send alert with specific error message
            await sendAlert(`🚨 PR creation failed: ${err.message}`, job);
          }
        }
      } catch (err) {
        await updateJob({
          status: "FAILED",
          $push: {
            timeline: {
              step: "Patch execution failed",
              time: new Date(),
              reason: err.message,
            },
          },
        });

        await sendAlert(`🚨 Patch failed: ${job.error}`, job);
        return;
      }

      // 🎉 success
      const doneJob = await updateJob({
        status: "DONE",
        execution: execResult,
        $push: {
          timeline: { step: "Patch applied", time: new Date() },
        },
      });

      await sendAlert(`✅ Auto-fixed: ${job.error}`, doneJob);
    } catch (err) {
      console.error("Agent failed:", err);

      if (job?._id) {
        await Job.findByIdAndUpdate(
          job._id,
          {
            status: "FAILED",
            $push: {
              timeline: {
                step: "Agent crashed",
                time: new Date(),
                reason: err.message,
              },
            },
          },
          { returnDocument: "after" },
        );

        await sendAlert(`💥 Agent crashed: ${job.error}`, job);
      }
    }
  }, 2000);
}
