# Eight-Phase Interleaved Buck Converter (Simulink)

This repository packages MATLAB/Simulink scripts that programmatically
build and simulate an eight‑phase interleaved Buck converter.  The model
includes:

- Three‑phase diode rectifier with 380 V/50 Hz input
- DC bus capacitor sized for ≈2 % voltage ripple at 1200 A
- Eight Buck phases operating at 12.5 kHz, shifted by 45°
- Dual PI control loops with automatic constant‑voltage/constant‑current
  switching via `min` logic
- Current "pit" capability (800 A → 300 A → 800 A)

## Usage
1. Open MATLAB with Simscape Electrical / Power Systems installed.
2. Run `run_eight_phase_buck_sim` to build and simulate the model.  The
   function returns a `Simulink.SimulationOutput` object.  Example:

   ```matlab
   simOut = run_eight_phase_buck_sim();
   plot(simOut.Vout(:,1), simOut.Vout(:,2));
   ```

   Both output voltage (`Vout`) and current (`Iout`) are logged to the
   workspace for further analysis.

## Files
- `build_eight_phase_buck_model.m` – Constructs the Simulink model.
- `run_eight_phase_buck_sim.m` – Helper to build and run the simulation.
- `TESTING.md` – Step‑by‑step instructions for verifying the model.

## Requirements
- MATLAB R2020b or later
- Simscape Electrical / Power Systems toolbox

## Disclaimer
These scripts were created without executing MATLAB/Simulink in this
environment.  Please validate on a local installation before delivery to
your customer.
