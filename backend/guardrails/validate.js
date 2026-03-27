import { syntaxCheck } from "./rules/syntax.js";
import { securityCheck } from "./rules/security.js";
import { scopeCheck } from "./rules/scope.js";
import { qualityCheck } from "./rules/quality.js";

export function validatePatch(patch) {
  const checks = [syntaxCheck, securityCheck, scopeCheck, qualityCheck];

  for (let check of checks) {
    const result = check(patch);
    if (!result.valid) {
      return result;
    }
  }

  return { valid: true };
}
