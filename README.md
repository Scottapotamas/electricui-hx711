# Multi-HX711 with UI

HX711 Interface for an arbitrary number of load cells with calibration support and realtime graphing.

By default, the firmware has been configured for 3 load cells, for use with a Forsentek F3N-1kN triaxial load cell unit.

# Setup

## Firmware

1. Load up the `/firmware/hx711_electricui.ino` file with an Arduino compatible toolchain.

2. Install the `bogde/HX711` library [from Github](https://github.com/bogde/HX711) or by searching for HX711 in the Arduino library manager and installing the option listed as `HX711 Arduino Library by Bogdan Necula`.
3. Install the Adafruit FRAM SPI library.
4. Select the relevant board, and flash to the microcontroller. This was written with a Feather M0, but the HX711 and FRAM are all using 'soft' IO and should port to pretty much all Arduino targets.

## User Interface

1. Assumes you have a working [Electric UI toolchain](https://electricui.com/install).
2. In your shell, navigate to `/interface`, and run `arc start` to launch the UI.
   - In some instances, you may need to run an `arc sacrifice` to clear caches and re-build the project.
3. The UI should have booted. Connect the hardware.

> It may be desired to build executables of the UI rather than running the development environment. 
>
> This is pretty simple, just run `arc build` in the interface directory root, wait, then the standalone binary will be placed in the `/interface/release` folder.

# Usage

## Adding/Modifying HX711 Instances

- Configure the number of load cells in use by modifying the `HX711Def_t` entries at the top of the firmware file. 
- Specify the data and clock pins in the `HX711HardwareConfiguration_t scale_config[]`, where the pin numbers are the Arduino-branded pin name.

The sampling, calibration, communications and UI code should adapt to the number of load cells specified at compile time.

## Calibration

The UI shows the 3 channels by default, and calibration controls are provided on the lower part of each load cell's card.

1. Remove mass from the given axis to calibrate. Click the first calibration button.
2. Add a test mass to the axis, and drag the calibration mass slider to specify the weight in kilograms.
3. Click the second calibration button to commit the calibrated mass value. Remove the test mass, and the reading should zero.
4. Check the calibration.
5. Repeat for the other axis as needed.
6. Once done, click "Save" to commit the calibration values for all load cells to storage. These values will be loaded at boot.

## Notes

- The tare button just zeroes the reading, but doesn't change calibration.
- The firmware tares all axis at startup.

# Remaining tasks

- Minor cosmetic improvements to the UI
- Add logging to CSV
- Expose analog readings for temperature/voltages to add additional test-bench functionality.
