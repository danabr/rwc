#!/usr/bin/env node
"use strict";

if(process.argv.length <= 2) {
  console.log("Usage: " + __filename + " <path-to-waypoints-js>");
  process.exit(-1);
}
const waypointPath = process.argv[2];

const fs = require("fs");
const insurance = require("../lib/insurance_calculations.js");

const input = fs.readFileSync(waypointPath);
const json = JSON.parse(input);
const waypoints = insurance.toTimeSortedWaypoints(json);
const result = insurance.calculateInsuranceMaterial(waypoints);

console.log("distanceSpeeding: " + result.distanceSpeeding);
console.log("durationSpeeding: " + result.durationSpeeding);
console.log("totalDistance: " + result.totalDistance);
console.log("totalDuration: " + result.totalDuration);
