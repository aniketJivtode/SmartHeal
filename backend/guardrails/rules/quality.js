export function qualityCheck(patch) {
  // must include logical handling
  if (!patch.includes("if")) {
    return {
      valid: false,
      reason: "Patch missing condition handling",
    };
  }

  // avoid useless patches
  if (patch.trim().length < 10) {
    return {
      valid: false,
      reason: "Patch too trivial",
    };
  }

  return { valid: true };
}
