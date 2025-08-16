function simOut = run_eight_phase_buck_sim(params)
%RUN_EIGHT_PHASE_BUCK_SIM Build and simulate the eight‑phase Buck model.
%   SIMOUT = RUN_EIGHT_PHASE_BUCK_SIM(PARAMS) calls
%   BUILD_EIGHT_PHASE_BUCK_MODEL with the structure PARAMS (optional) and
%   then runs a Simulink simulation using the generated model.  The
%   resulting Simulink.SimulationOutput object is returned.
%
%   Example:
%       prm.Vout_ref = 100;
%       prm.Iout_ref = 800;
%       simOut = run_eight_phase_buck_sim(prm);
%
%   See also BUILD_EIGHT_PHASE_BUCK_MODEL.

if nargin < 1
    params = struct();
end

build_eight_phase_buck_model(params);
model = 'EightPhaseBuckModel';
set_param(model,'StopTime',num2str(getfield(params,'t_sim',0.05)));

try
    simOut = sim(model);
catch ME
    warning('Simulation failed: %s',ME.message);
    simOut = [];
end
end
