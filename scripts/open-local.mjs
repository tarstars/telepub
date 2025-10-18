#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

const htmlPath = path.resolve("dist/index.html");

if (!fs.existsSync(htmlPath)) {
  console.error("dist/index.html not found. Run `npm run preview` first.");
  process.exit(1);
}

openTarget(htmlPath);

function openTarget(target) {
  const platform = process.platform;

  if (platform === "darwin") {
    spawn("open", [target], { stdio: "ignore", detached: true }).unref();
    return;
  }

  if (platform === "win32") {
    spawn("cmd", ["/c", "start", "", target], {
      stdio: "ignore",
      detached: true
    }).unref();
    return;
  }

  spawn("xdg-open", [target], { stdio: "ignore", detached: true }).unref();
}
