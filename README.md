# 3x HX711 with UI

HX711 Interface for 3x load cells with basic calibration support and realtime graphing.



# Setup

## Firmware

1. Load up the `/firmware/hx711_electricui.ino` file with an Arduino compatible toolchain.

2. Install the `bogde/HX711` library [from Github](https://github.com/bogde/HX711) or by searching for HX711 in the Arduino library manager and installing the option listed as `HX711 Arduino Library by Bogdan Necula`.
3. Select the relevant board, and flash to the microcontroller.

## User Interface

1. Assumes you have a working [Electric UI toolchain](https://electricui.com/install).
2. In your shell, navigate to `/interface`, and run `arc start` to launch the UI.
   - In some instances, you may need to run an `arc sacrifice` to clear caches and re-build the project.
3. The UI should have booted. Connect the hardware.

> It may be desired to build executables of the UI rather than running the development environment. 
>
> This is pretty simple, just run `arc build` in the interface directory root, wait, then the standalone binary will be placed in the `/interface/release` folder.

# Usage

## Calibration

The UI shows the 3 channels by default, and calibration controls are provided on the lower part of the window.

1. Remove mass from the given axis to calibrate. Click the first button
2. Add a test mass to the axis, and drag the slider to specify the weight in kilograms.
3. Click the third button to commit the calibrated mass value. Remove the test mass, and the reading should zero.
4. Check the calibration.
5. Repeat for the other axis as needed.

## Notes

-  Calibration is not stored in non-volatile memory, so recalibration on startup is required
- The tare button just zeroes the reading, but doesn't change calibration.



# Remaining tasks

- Add logging to CSV
- Expose analog readings for temperature/voltages to complete the test-bench functionality.
- Save & Load calibration values from memory at powerup
- Refactor firmware and UI to support arbitrary counts of load cells, structure driven in arrays etc.

