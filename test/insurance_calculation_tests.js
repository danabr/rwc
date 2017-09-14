#!/usr/bin/env node
"use strict";

const assert = require("assert");
const insurance = require("../lib/insurance_calculations.js");
const calculateInsuranceMaterial = insurance.calculateInsuranceMaterial;
const toTimeSortedWaypoints = insurance.toTimeSortedWaypoints;

const noCalculationResult = {
  distanceSpeeding: 0,
  durationSpeeding: 0,
  totalDistance: 0,
  totalDuration: 0
};

const tick1 = Date.parse("2017-09-01T00:00:00.000Z");
const tick2 = Date.parse("2017-09-01T00:00:05.000Z");
const tick3 = Date.parse("2017-09-01T00:00:10.000Z");

const tests = [

  function toTimeSortedWaypointsSortsByTime() {
    const pos = {
      longitude: 59.3331,
      latitude: 18.0664
    };
    const input = [ {
                      timestamp: "2017-09-01T00:00:01.000Z",
                      speed: 2.0,
                      speed_limit: 2.0,
                      position: pos
                    },
                    {
                      timestamp: "2017-08-31T23:59:59.000Z",
                      speed: 1.0,
                      speed_limit: 1.0,
                      position: pos
                    },
                    {
                      timestamp: "2017-09-02T00:00:00.000Z",
                      speed: 3.0,
                      speed_limit: 3.0,
                      position: pos
                    }
                  ];

    const expected = [ {
                         timestamp: Date.parse("2017-08-31T23:59:59.000Z"),
                         speed: 1.0,
                         speedLimit: 1.0,
                         position: pos
                       },
                       {
                         timestamp: Date.parse("2017-09-01T00:00:01.000Z"),
                         speed: 2.0,
                         speedLimit: 2.0,
                         position: pos
                       },
                       {
                         timestamp: Date.parse("2017-09-02T00:00:00.000Z"),
                         speed: 3.0,
                         speedLimit: 3.0,
                         position: pos
                       }
                     ];

    assert.deepStrictEqual(expected, toTimeSortedWaypoints(input));
  },

  function noCalculationIfNoWaypoint() {
    assert.deepStrictEqual(noCalculationResult,
                           calculateInsuranceMaterial([]));
  },

  function noCalculationWithOneWaypoint() {
    const wp = {
      timestamp: tick1,
      speed: 1,
      speedLimit: 1,
      position: { latitude: 59.334, longitude: 18.0667 }
    };

    assert.deepStrictEqual(noCalculationResult,
                           calculateInsuranceMaterial([wp]));
  },

  function noDistanceIfNotMoved() {
    const wp1 = {
      timestamp: tick1,
      speed: 0,
      speedLimit: 1,
      position: { latitude: 59.334, longitude: 18.0667 }
    };
    const wp2 = Object.assign({}, wp1, { timestamp: tick2 });

    const expected = {
      distanceSpeeding: 0,
      durationSpeeding: 0,
      totalDistance: 0,
      totalDuration: 5
    };

    assert.deepStrictEqual(expected, calculateInsuranceMaterial([wp1, wp2]));
  },

  function notSpeeding() {
    const pos1 = { latitude: 59.334, longitude: 18.0667 };
    const pos2 = { latitude: 59.334, longitude: 18.0668 };
    const wp1 = {
      timestamp: tick1,
      speed: 1.0,
      speedLimit: 1.2,
      position:  pos1
    };
    const wp2 = Object.assign({}, wp1, { timestamp: tick2, position: pos2 });

    const expected = {
      distanceSpeeding: 0,
      durationSpeeding: 0,
      totalDistance: 6,
      totalDuration: 5
    };

    assert.deepStrictEqual(expected, calculateInsuranceMaterial([wp1, wp2]));
  },

  function speeding() {
    const pos1 = { latitude: 59.334, longitude: 18.0667 };
    const pos2 = { latitude: 59.334, longitude: 18.0668 };
    const wp1 = {
      timestamp: tick1,
      speed: 1.0,
      speedLimit: 1.1,
      position:  pos1
    };
    const wp2 = Object.assign({}, wp1, { timestamp: tick2, position: pos2 });
    const expected = {
      distanceSpeeding: 6,
      durationSpeeding: 5,
      totalDistance: 6,
      totalDuration: 5
    };

    assert.deepStrictEqual(expected, calculateInsuranceMaterial([wp1, wp2]));
  },

  function upperSpeedLimitUsedIfDifferent() {
    const pos1 = { latitude: 59.334, longitude: 18.0667 };
    const pos2 = { latitude: 59.334, longitude: 18.0668 };
    const wp1 = {
      timestamp: tick1,
      speed: 1.0,
      speedLimit: 1.1,
      position:  pos1
    };
    const wp2 = Object.assign({}, wp1, {
                                         timestamp: tick2,
                                         position: pos2,
                                         speedLimit: 1.2
                                       });
    const expected = {
      distanceSpeeding: 0,
      durationSpeeding: 0,
      totalDistance: 6,
      totalDuration: 5
    };

    // Acceleration
    assert.deepStrictEqual(expected, calculateInsuranceMaterial([wp1, wp2]));
    // Retardation
    const wp3 = Object.assign({}, wp1, { speedLimit: 1.2 });
    const wp4 = Object.assign({}, wp2, { speedLimit: 1.1 });
    assert.deepStrictEqual(expected, calculateInsuranceMaterial([wp3, wp4]));
  }

];

let errors = 0;

for(const test of tests) {
  try {
   test();
  } catch(e) {
    errors += 1;
    console.log(e.stack);
  }
}

if(errors > 0) {
  console.log("" + errors + "/" + tests.length + " tests failed.");
} else {
  console.log("All " + tests.length + " tests passed.");
}
