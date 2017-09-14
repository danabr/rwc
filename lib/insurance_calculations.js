#!/usr/bin/env node
"use strict";


// Convert from JSON to internal representation.
const toTimeSortedWaypoints = function(jsonWaypoints) {
  return jsonWaypoints.map(function(wp) {
    return {
      timestamp: Date.parse(wp.timestamp),
      position: wp.position,
      speedLimit: wp.speed_limit,
      speed: wp.speed
    }}).sort(compareByTimestamp);
}

// Calculates material for insurance calcualations.
// Input: An array of waypoints sorted by time.
// Assumption: All waypoints have distinct timestamps.
// Note: When two waypoints have different speed limits, we assume the
// higher speed limit, since we cannot possibly know the point in
// between where the speed limit changed. Given frequent enough
// waypoints, this should not cause problems.
const calculateInsuranceMaterial = function(waypoints) {
  let result = {
    distanceSpeeding: 0.0,
    durationSpeeding: 0.0,
    totalDistance: 0.0,
    totalDuration: 0.0
  };

  // Without at least 2 waypoints, we cannot say anything.
  if(waypoints.length <= 1) {
    return result;
  }

  let it = waypoints[Symbol.iterator]();
  let prev = it.next().value;

  for(const next of it) {
    const distance = calcDistanceInMeters(prev.position, next.position);
    const timeDiff = calcTimeDiffInSecs(prev, next);
    const avgSpeed = distance/timeDiff;
    const maxSpeedLimit = Math.max(prev.speedLimit, next.speedLimit);
    if(avgSpeed > maxSpeedLimit) {
      result.distanceSpeeding += distance;
      result.durationSpeeding += timeDiff;
    }

    result.totalDistance += distance;
    result.totalDuration += timeDiff;

    prev = next;
  }

  return result;
}

// Note: Here we would use something like geolib, but since I don't
// want to add any dependencies for this little excercise, I just
// copied getDistanceSimple from geolib.
// See https://github.com/manuelbieh/Geolib/blob/master/src/geolib.js
// Note: I've not considered which accuracy is needed for these calculations.
// In the real world, you should.
const calcDistanceInMeters = function(pointA, pointB) {
  const accuracy = 1;
  const radiusOfEarth = 6378137;
  const distance = Math.round(
                      Math.acos(
                        Math.sin(toRad(pointB.latitude)) *
                        Math.sin(toRad(pointA.latitude)) +
                        Math.cos(toRad(pointB.latitude)) *
                        Math.cos(toRad(pointA.latitude)) *
                        Math.cos(
                            toRad(pointA.longitude) -
                            toRad(pointB.longitude)
                        )
                      ) * radiusOfEarth
              );

  return Math.floor(Math.round(distance/accuracy)*accuracy);
}

const toRad = function(x) {
  return x * Math.PI / 180;
}

// Assumption: wp2.timestamp >= wp1.timestamp
const calcTimeDiffInSecs = function(wp1, wp2) {
  return (wp2.timestamp - wp1.timestamp) / 1000.0;
}

const compareByTimestamp = function(w1, w2) {
  if (w1.timestamp < w2.timestamp) {
    return -1;
  } else if(w1.timestamp == w2.timestamp) {
    return 0;
  } else {
    return 1;
  }
}


exports.toTimeSortedWaypoints = toTimeSortedWaypoints
exports.calculateInsuranceMaterial = calculateInsuranceMaterial
