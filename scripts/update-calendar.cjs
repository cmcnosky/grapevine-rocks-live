const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const runtime = { window: {}, URL, Intl, Date, structuredClone, console, TextEncoder };
vm.runInNewContext(fs.readFileSync(path.join(root, "guide.js"), "utf8"), runtime);
const calendar = runtime.window.GRLGuide.calendarFeed();
if (!calendar.startsWith("BEGIN:VCALENDAR\r\n") || !calendar.includes("BEGIN:VEVENT\r\n")) {
  throw new Error("The music guide did not produce a populated iCalendar feed.");
}
fs.writeFileSync(path.join(root, "calendar.ics"), calendar, "utf8");
