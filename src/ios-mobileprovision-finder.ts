#!/usr/bin/env node

import * as yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { provision, cert } from "./index";
import chalk from "chalk";

const argv = yargs(hideBin(process.argv))
  .usage("Usage: $0 -u [device udid] -i [app bundle id]")
  .option("udid", {
    string: true,
    array: true,
    describe:
      "Provide one or more device UUIDs the searched provisioning profile should be able to deploy to.",
  })
  .alias("u", "udid")
  .option("app-id", {
    string: true,
    array: false,
    describe:
      "Provide application bundle identifier the searched provisioning profile should match.",
  })
  .alias("i", "app-id")
  .option("eligible", {
    boolean: true,
    array: false,
    describe: "Prints only eligible profiles",
    default: false,
  })
  .alias("e", "eligible")
  .option("team", {
    string: true,
    array: false,
    describe: "Provide team name the provisioning profile should belong to.",
  })
  .alias("t", "team")
  .option("type", {
    string: true,
    array: false,
    choices: ["development", "distribution", "adhoc", "all"],
    default: "development",
    describe:
      "'development', 'distribution', 'adhoc' or 'all'; - specify the provisioning profile type.",
  })
  .alias("p", "type")
  .help("h")
  .alias("h", "help")
  .parseSync();

// console.log(argv);
const options: provision.Query = {};
if (argv.udid) {
  options.ProvisionedDevices = argv.udid;
}

if (argv["app-id"]) {
  options.AppId = argv["app-id"];
}

if (argv["type"] != "all") {
  // @ts-ignore
  options.Type = {
    development: "Development",
    distribution: "Distribution",
    adhoc: "AdHoc",
    enterprise: "Enterprise",
  }[argv["type"]];
}

if (argv["team"]) {
  options.TeamName = argv["team"];
}

const certs = cert.read();
options.Certificates = certs.valid;
const profiles = provision.read();
const result = provision.select(profiles, options);

const months = [
  "Jan",
  "Feb",
  "Marc",
  "Apr",
  "May",
  "June",
  "July",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];
function formatDate(date: Date): string {
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}
function formatProfile(profile: provision.MobileProvision): string {
  return (
    "'" +
    chalk.bold(profile.Name) +
    "' " +
    profile.TeamName +
    " " +
    chalk.gray(
      "(exp: " +
        formatDate(profile.ExpirationDate) +
        ") " +
        profile.UUID +
        " id: "
    ) +
    profile.Entitlements["application-identifier"] +
    chalk.gray(" " + profile.Type)
  );
}
console.log(chalk.bold("eligible:"));
result.eligible.forEach((p) => console.log(" - " + formatProfile(p)));
if (!argv.eligible) {
  console.log(chalk.bold("non eligible:"));
  result.nonEligible.forEach((p) => console.log(" - " + formatProfile(p)));
}
