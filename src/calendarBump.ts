import { setOutput, getInput } from "@actions/core";

const VERSION_REGEX = /(\d{2})\.(\d{1,2})\.(\d{1,2})\.(\d+)/g;

function formatCurrentDate(): { year: number; month: number; day: number } {
  const today = new Date();

  const year = parseInt(String(today.getFullYear()).slice(2));
  const month = today.getMonth() + 1;
  const day = today.getDate();

  return { year, month, day };
}

export default function writeNewVersion() {
  const formattedCurrentDate = formatCurrentDate();

  const tag = getInput("tag");

  let currentVersion: { year: number; month: number; day: number; bump: number; };

  if (!tag) {
    currentVersion = {
      year: formattedCurrentDate.year,
      month: formattedCurrentDate.month,
      day: formattedCurrentDate.day,
      bump: 0,
    }
  } else {
    const currentVersionBitsFromTag = [
      ...tag.matchAll(VERSION_REGEX),
    ];

    currentVersion = {
      year: parseInt(currentVersionBitsFromTag[0][1]),
      month: parseInt(currentVersionBitsFromTag[0][2]),
      day: parseInt(currentVersionBitsFromTag[0][3]),
      bump: parseInt(currentVersionBitsFromTag[0][4]),
    }
  }

  setOutput(
    "old",
    `v${currentVersion.year}.${currentVersion.month}.${currentVersion.day}.${currentVersion.bump}`
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

  setOutput(
    "new",
    `v${newFormattedVersion.year}.${newFormattedVersion.month}.${newFormattedVersion.day}.${newFormattedVersion.bump}`
  );
}
