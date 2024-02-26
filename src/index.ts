import { setFailed } from "@actions/core";
import writeNewVersion from "./calendarBump";

export function run() {
  try {
    writeNewVersion();
  } catch (err) {
    if (err instanceof Error) {
      setFailed(err.message);
    }
  }
}

run();
