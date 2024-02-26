import { writeFileSync, readFileSync, existsSync } from "fs";
import { setOutput } from "@actions/core";
import { cwd } from "process";

const VERSION_REGEX = /(\d{2})\.(\d{1,2})\.(\d{1,2})\.(\d+)/g;

function formatCurrentDate(): { year: number; month: number; day: number } {
  const today = new Date();

  const year = parseInt(String(today.getFullYear()).slice(2));
  const month = today.getMonth() + 1;
  const day = today.getDate();

  return { year, month, day };
}

function formatCurrentVersionFile(): {
  year: number;
  month: number;
  day: number;
  bump: number;
} {
  const versionFileContents = readFileSync("VERSION", "utf-8");

  const currentVersionBitsFromFile = [
    ...versionFileContents.matchAll(VERSION_REGEX),
  ];

  return {
    year: parseInt(currentVersionBitsFromFile[0][1]),
    month: parseInt(currentVersionBitsFromFile[0][2]),
    day: parseInt(currentVersionBitsFromFile[0][3]),
    bump: parseInt(currentVersionBitsFromFile[0][4]),
  };
}

export default function writeNewVersion() {
  const formattedCurrentDate = formatCurrentDate();

  if (!existsSync(`${cwd()}/VERSION`)) {
    const output = `${formattedCurrentDate.year}.${formattedCurrentDate.month}.${formattedCurrentDate.day}.0`;
    writeFileSync("VERSION", output + "\n");
    setOutput("previous-version", output);
    setOutput("new-version", output);
    return;
  }

  const currentVersion = formatCurrentVersionFile();

  setOutput(
    "previous-version",
    `${currentVersion.year}.${currentVersion.month}.${currentVersion.day}.${currentVersion.bump}`,
  );

  // If any of the date bits don't match the current date, we should revert the bump bit to 0
  const areDateBitsDifferent =
    currentVersion.year !== formattedCurrentDate.year ||
    currentVersion.month !== formattedCurrentDate.month ||
    currentVersion.day !== formattedCurrentDate.day;

  const newFormattedVersion = {
    year: formattedCurrentDate.year,
    month: formattedCurrentDate.month,
    day: formattedCurrentDate.day,
    bump: areDateBitsDifferent ? 0 : currentVersion.bump + 1,
  };

  writeFileSync(
    "VERSION",
    `${newFormattedVersion.year}.${newFormattedVersion.month}.${newFormattedVersion.day}.${newFormattedVersion.bump}\n`,
  );

  setOutput(
    "new-version",
    `${newFormattedVersion.year}.${newFormattedVersion.month}.${newFormattedVersion.day}.${newFormattedVersion.bump}`,
  );
}
