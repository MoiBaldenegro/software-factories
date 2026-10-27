import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const taskPath = "factory/tasks/add-health-endpoint.md";

async function runAgent() {
  const task = await readFile(taskPath, "utf8");

  const prompt = `
Follow AGENTS.md.

Implement the task below:
${task}

Requirements:
- Inspect the existing project first.
- Implement the smallest complete change.
- Add tests.
- Do not deploy anything.
- Report files changed and commands executed.
`;

  const command = process.platform === "win32"
    ? join(process.env.APPDATA, "npm", "node_modules", "opencode-ai", "bin", "opencode.exe")
    : "opencode";
  const child = spawn(command, ["run", prompt], {
    stdio: "inherit",
    shell: false,
  });

  const exitCode = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (code) => resolve(code));
  });

  if (exitCode !== 0) {
    throw new Error(
      `Agent failed with exit code ${exitCode}`,
    );
  }

  console.log("Agent finished. Next: inspect diff and run CI.");
}

runAgent().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});