// services/githubService.js
import axios from "axios";

/**
 * Validate GitHub OAuth token
 * @param {string} token - GitHub OAuth token
 * @returns {Promise<boolean>} - True if token is valid
 */
export async function validateToken(token) {
  try {
    // Try both Bearer and token formats
    const headers = {
      Accept: "application/vnd.github+json",
    };

    // First try Bearer format (OAuth tokens)
    try {
      await axios.get("https://api.github.com/user", {
        headers: {
          ...headers,
          Authorization: `Bearer ${token}`,
        },
      });
      return true;
    } catch (err) {
      // If Bearer fails, try token format (personal access tokens)
      try {
        await axios.get("https://api.github.com/user", {
          headers: {
            ...headers,
            Authorization: `token ${token}`,
          },
        });
        return true;
      } catch (err2) {
        // Both formats failed, token is invalid
        console.error("Token validation failed:", {
          bearerError: err.response?.data,
          tokenError: err2.response?.data,
        });
        return false;
      }
    }
  } catch (err) {
    console.error("Token validation error:", err.message);
    return false;
  }
}

export async function createPR({ repo, patch }) {
  const [owner, repoName] = repo.fullName.split("/");
  const token = repo.accessToken;

  console.log("Creating PR for repo:", repo.fullName);
  console.log("Token (first 10 chars):", token?.substring(0, 10) + "...");

  // Try both Bearer and token formats
  const tryWithFormat = async (format) => {
    const headers = {
      Authorization: `${format} ${token}`,
      Accept: "application/vnd.github+json",
    };

    console.log(`Trying GitHub API with format: ${format}`);

    // 0️⃣ Validate token before proceeding
    const isTokenValid = await validateToken(token);
    if (!isTokenValid) {
      throw new Error(
        `GitHub API unauthorized: The OAuth token is invalid or expired. ` +
          `Please reconnect your GitHub repository through the ConnectRepoWizard.`,
      );
    }

    // 1️⃣ Get default branch
    const repoData = await axios.get(
      `https://api.github.com/repos/${owner}/${repoName}`,
      { headers },
    );

    const baseBranch = repoData.data.default_branch;

    // 2️⃣ Get latest commit SHA
    const refData = await axios.get(
      `https://api.github.com/repos/${owner}/${repoName}/git/ref/heads/${baseBranch}`,
      { headers },
    );

    const baseSha = refData.data.object.sha;

    // 3️⃣ Create new branch
    const newBranch = `smartheal-fix-${Date.now()}`;

    await axios.post(
      `https://api.github.com/repos/${owner}/${repoName}/git/refs`,
      {
        ref: `refs/heads/${newBranch}`,
        sha: baseSha,
      },
      { headers },
    );

    // 4️⃣ Commit the patch as a real file so the branch diverges from base
    //    Without at least one commit the PR creation returns 422: "No commits between base and head"
    const fileName = `smartheal-patches/fix-${Date.now()}.patch`;
    const fileContent = Buffer.from(
      `# SmartHeal Auto Fix\n\n${patch}`,
    ).toString("base64");

    // Get the current file SHA if it already exists (required for updates)
    let fileSha;
    try {
      const existing = await axios.get(
        `https://api.github.com/repos/${owner}/${repoName}/contents/${fileName}`,
        { headers, params: { ref: newBranch } },
      );
      fileSha = existing.data.sha;
    } catch (_) {
      // file does not exist yet — that's expected on a fresh branch
    }

    await axios.put(
      `https://api.github.com/repos/${owner}/${repoName}/contents/${fileName}`,
      {
        message: "🤖 SmartHeal: add auto-generated fix patch",
        content: fileContent,
        branch: newBranch,
        ...(fileSha ? { sha: fileSha } : {}),
      },
      { headers },
    );

    // 5️⃣ Create PR
    const prBody =
      patch.length > 60000
        ? patch.substring(0, 60000) + "\n\n...(truncated)"
        : patch;

    const pr = await axios.post(
      `https://api.github.com/repos/${owner}/${repoName}/pulls`,
      {
        title: "🤖 SmartHeal Auto Fix",
        head: newBranch,
        base: baseBranch,
        body: `Auto-generated fix:\n\n\`\`\`\n${prBody}\n\`\`\``,
      },
      { headers },
    );

    return pr.data.html_url;
  };

  try {
    // Try Bearer format first (OAuth tokens)
    return await tryWithFormat("Bearer");
  } catch (err) {
    // Enhanced error handling for common GitHub API issues
    const status = err.response?.status;
    const data = err.response?.data;
    const message = err.message;

    console.error("GitHub API Error:", {
      status,
      data,
      message,
      endpoint: err.config?.url,
    });

    // If Bearer fails, try token format (personal access tokens)
    if (status === 401) {
      try {
        return await tryWithFormat("token");
      } catch (err2) {
        // Both formats failed, provide detailed error message
        if (data?.message?.includes("Bad credentials")) {
          throw new Error(
            `GitHub API unauthorized: The OAuth token is invalid or expired. ` +
              `Please reconnect your GitHub repository through the ConnectRepoWizard.`,
          );
        }
        throw new Error(
          `GitHub API unauthorized: The OAuth token is invalid or expired. ` +
            `Please reconnect your GitHub repository through the ConnectRepoWizard.`,
        );
      }
    }

    // Provide specific error messages for common issues
    if (status === 403) {
      if (data?.message?.includes("Resource not accessible by integration")) {
        throw new Error(
          `GitHub App permissions error: The OAuth token doesn't have sufficient permissions. ` +
            `Please ensure:\n` +
            `1. You're using a GitHub OAuth App (not a GitHub App)\n` +
            `2. The OAuth App has 'repo' scope enabled\n` +
            `3. The repository doesn't have branch protection rules preventing branch creation\n` +
            `4. The token hasn't expired`,
        );
      }
      if (data?.message?.includes("Forbidden")) {
        throw new Error(
          `GitHub API forbidden: The token doesn't have permission to perform this action. ` +
            `Check that the OAuth App has 'repo' scope and the repository allows the action.`,
        );
      }
    }

    if (status === 404) {
      throw new Error(
        `GitHub API not found: The repository was not found. ` +
          `Check that the repository exists and the token has access to it.`,
      );
    }

    // Re-throw with original message for other errors
    throw new Error(`GitHub API error: ${message}`);
  }
}
