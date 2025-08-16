# Testing Instructions

The repository cannot be executed within this environment.  To verify the
scripts locally, follow the steps below.

1. **Open MATLAB** with Simscape Electrical / Power Systems installed.
2. **Add repository folder to the MATLAB path**:
   ```matlab
   addpath('path_to_repository');
   ```
3. **Build and simulate**:
   ```matlab
   simOut = run_eight_phase_buck_sim();
   ```
4. **Inspect outputs**:
   - Voltage waveform: `plot(simOut.Vout(:,1), simOut.Vout(:,2))`
   - Current waveform: `plot(simOut.Iout(:,1), simOut.Iout(:,2))`
   - Confirm constant‑voltage/constant‑current transitions and the
     20 ms current dip from 800 A to 300 A.
5. **Adjust parameters** if necessary by passing a struct to
   `run_eight_phase_buck_sim`:
   ```matlab
   prm.Vout_ref = 110;
   prm.Iout_ref = 1000;
   simOut = run_eight_phase_buck_sim(prm);
   ```

If MATLAB reports missing blocks or toolbox functions, ensure that the
Simscape Electrical toolbox is installed and licensed.  After successful
simulation, export the `.slx` model and waveforms for delivery.
