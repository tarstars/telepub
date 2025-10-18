#!/usr/bin/env node
import { spawn } from "child_process";

const url = "https://tarstars.github.io/telepub/";

openTarget(url);

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
