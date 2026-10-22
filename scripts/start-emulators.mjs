import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

export function emulatorArgs(hasExport) {
  return [
    "emulators:start",
    "--project",
    "demo-withyou",
    ...(hasExport ? ["--import=./firebase/data"] : []),
    "--export-on-exit=./firebase/data",
  ];
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const args = emulatorArgs(
    existsSync(resolve(root, "firebase/data/firebase-export-metadata.json")),
  );
  if (process.argv.includes("--print-config"))
    console.log(
      JSON.stringify({
        project: "demo-withyou",
        importsExistingExport: args.some((arg) => arg.startsWith("--import=")),
        args,
      }),
    );
  else {
    const cli = fileURLToPath(
      new URL(
        "../node_modules/firebase-tools/lib/bin/firebase.js",
        import.meta.url,
      ),
    );
    const child = spawn(process.execPath, [cli, ...args], {
      cwd: root,
      stdio: "inherit",
    });
    process.on("SIGINT", () => {
      if (process.platform !== "win32") child.kill("SIGINT");
    });
    process.on("SIGTERM", () => child.kill("SIGTERM"));
    child.on("error", () => {
      console.error(
        "Cannot start Firebase. Run npm ci and check Java 17 is installed.",
      );
      process.exitCode = 1;
    });
    child.on("exit", (code) => {
      process.exitCode = code ?? 1;
    });
  }
}
