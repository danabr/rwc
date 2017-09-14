# Solution to Springworks waypoint challenge

## Dependencies
* nodejs, (tested with version 4.7.2)

No dependencies are used, only the builtin functionality of nodejs:
* This makes it easier for you to run the test script.
* Less distraction from the task at hand.
* ... but less realistic of course.

## How to run
./bin/calculate_insurance_material.js test/fixtures/waypoints.json

## How to run the tests
./test/insurance_calculation_tests.js

## Notes
Note that we ignore the "speed" property. Since it is a point in time
value, it cannot tell us how long that speed is maintained. Instead,
we calculate the average speed between two points and compare it to
the maximum allowed speed limit.

Since for two waypoints we have two speed limits , we must chose one of them, or combine them in some way:
* If we choose the minimum, there is a slight risk that the insurance
  taker gets recorded as speeding, although he/she hasn't been.
* If we choose the maximum, we might miss that the driver is speeding.

In this case, I chose the latter one, reasoning that a customer should
not be punished if his insurance company has limited data collection
abilities. However, with frequent enough waypoints, this strategy should
not cause problems for the insurance company either.
