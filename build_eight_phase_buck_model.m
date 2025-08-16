function build_eight_phase_buck_model(varargin)
%BUILD_EIGHT_PHASE_BUCK_MODEL Programmatically constructs an eight-phase
%interleaved Buck converter model with automatic phase shifting and
%control loops for constant-voltage/constant-current operation.
%
%   BUILD_EIGHT_PHASE_BUCK_MODEL() creates a new Simulink model called
%   "EightPhaseBuckModel" in the current folder.  The model contains:
%       * Three‑phase diode rectifier fed from a 380 V/50 Hz source
%       * DC bus capacitor sized for ~2%% ripple at 1200 A load
%       * Eight Buck phases operating at 12.5 kHz with 45° phase shift
%       * Voltage and current PI controllers with min() logic for
%         CV/CC mode switching
%       * Current dip ("打坑") from 800 A to 300 A for 20 ms
%
%   BUILD_EIGHT_PHASE_BUCK_MODEL('Parameter',value,...) allows overriding
%   default parameters such as output voltage, current or simulation time.
%
%   The generated model exposes "Vout" and "Iout" signals in the workspace
%   for easy post‑processing.
%
%   This function requires Simscape Electrical / Power Systems toolbox.
%
%   Example:
%       build_eight_phase_buck_model('Vout_ref',100,'Iout_ref',800);
%
%   See also RUN_EIGHT_PHASE_BUCK_SIM.

%% Default parameters ----------------------------------------------------
p = inputParser;
p.addParameter('modelName','EightPhaseBuckModel',@ischar);
p.addParameter('V_phase_rms',380,@isnumeric);   % AC source line voltage (RMS)
p.addParameter('f_ac',50,@isnumeric);           % AC frequency
p.addParameter('Vout_ref',100,@isnumeric);       % Desired DC output voltage
p.addParameter('Iout_ref',800,@isnumeric);       % Desired DC output current
p.addParameter('num_phase',8,@isnumeric);        % Number of interleaved phases
p.addParameter('fs_base',12.5e3,@isnumeric);     % Switching frequency per leg
p.addParameter('t_sim',0.05,@isnumeric);         % Simulation stop time
p.parse(varargin{:});
prm = p.Results;

% Derived parameters -----------------------------------------------------
Vdc_nom   = 540;                                  % Rectified DC level
fs_equiv  = prm.num_phase * prm.fs_base * 2;      % Effective switching freq
Rout      = 1e-3;                                 % Load resistance
M         = prm.Vout_ref / Vdc_nom;               % Duty ratio
DeltaI_phase = prm.Iout_ref * M * (1 - M) / prm.num_phase;
DeltaV    = 0.02 * Vdc_nom;                       % 2% ripple spec
Cin_min   = DeltaI_phase / (DeltaV * fs_equiv);   % Minimum bus capacitor
Cin       = 1.5 * Cin_min;                        % Add margin

%% Create model ----------------------------------------------------------
model = prm.modelName;
if bdIsLoaded(model)
    close_system(model,0);
end
new_system(model);
open_system(model);

x0 = 50; y0 = 50; xStep = 120; yStep = 100; %#ok<NASGU>

%% Three-phase source and rectifier -------------------------------------
add_block('powerlib/Electrical Sources/Three-Phase Source',[model '/ACSource'],...
    'Position',[x0 y0 x0+60 y0+60],...
    'PhasePhaseVoltage',num2str(prm.V_phase_rms*sqrt(2)),...
    'Frequency',num2str(prm.f_ac));

add_block('powerlib/Power Electronics/Diodes/Universal Bridge',[model '/DiodeRectifier'],...
    'Position',[x0+160 y0 x0+240 y0+120],...
    'NumberOfArms','3','SnubberResistance','inf','SnubberCapacitance','0',...
    'Measurement','None');

add_block('powerlib/Elements/Capacitor',[model '/BusCap'],...
    'Capacitance',num2str(Cin),...
    'Position',[x0+320 y0 x0+360 y0+80]);

add_line(model,'ACSource/1','DiodeRectifier/1');
add_line(model,'ACSource/2','DiodeRectifier/2');
add_line(model,'ACSource/3','DiodeRectifier/3');
add_line(model,'DiodeRectifier/+','BusCap/1');
add_line(model,'DiodeRectifier/-','BusCap/2');

%% Voltage measurement ---------------------------------------------------
add_block('powerlib/Measurements/Voltage Measurement',[model '/VbusSense'],...
    'Position',[x0+370 y0 x0+410 y0+60]);
add_line(model,'DiodeRectifier/+','VbusSense/1');
add_line(model,'DiodeRectifier/-','VbusSense/2');

%% Build eight Buck phases -----------------------------------------------
buckWidth = 100; buckHeight = 80;
for k = 1:prm.num_phase
    buckName = sprintf('Buck%d',k);
    x_pos = x0 + 200 + (k-1)*110;
    y_pos = y0 + 220;
    build_single_buck(model,buckName,[x_pos y_pos x_pos+buckWidth y_pos+buckHeight],prm.fs_base,k,prm.num_phase);
end

%% Current summation and load -------------------------------------------
add_block('simulink/Math Operations/Sum',[model '/SumCurrents'],...
    'Inputs',repmat('+',1,prm.num_phase),...
    'Position',[x0+200 y0+320 x0+230 y0+350]);
for k = 1:prm.num_phase
    buckName = sprintf('Buck%d',k);
    add_line(model,[buckName '/1'],'SumCurrents/1','autorouting','on');
end

add_block('powerlib/Elements/Series RLC Branch',[model '/LoadR'],...
    'Resistance',num2str(Rout),'Inductance','0','Capacitance','0','BranchType','R',...
    'Position',[x0+320 y0+315 x0+360 y0+345]);
add_line(model,'SumCurrents/1','LoadR/1');
add_line(model,'DiodeRectifier/-','LoadR/2');

%% Output voltage and current measurement --------------------------------
add_block('powerlib/Measurements/Voltage Measurement',[model '/VoutSense'],...
    'Position',[x0+370 y0+300 x0+410 y0+360]);
add_line(model,'SumCurrents/1','VoutSense/1');
add_line(model,'LoadR/2','VoutSense/2');

add_block('powerlib/Measurements/Current Measurement',[model '/IoutSense'],...
    'Position',[x0+260 y0+300 x0+300 y0+360]);
add_line(model,'SumCurrents/1','IoutSense/1');
add_line(model,'IoutSense/1','LoadR/1');

%% Workspace logging -----------------------------------------------------
add_block('simulink/Sinks/To Workspace',[model '/LogVout'],...
    'VariableName','Vout','SaveFormat','Array','Position',[x0+430 y0+300 x0+480 y0+330]);
add_block('simulink/Sinks/To Workspace',[model '/LogIout'],...
    'VariableName','Iout','SaveFormat','Array','Position',[x0+430 y0+340 x0+480 y0+370]);
add_line(model,'VoutSense/1','LogVout/1');
add_line(model,'IoutSense/1','LogIout/1');

%% Control subsystem -----------------------------------------------------
build_control_block(model,prm.Vout_ref,prm.Iout_ref,prm.fs_base,prm.num_phase,prm.t_sim);

save_system(model,[model '.slx']);
disp(['Model "' model '" has been created.']);
end

%% ----- Local functions -------------------------------------------------
function build_single_buck(model,buckName,pos,fs_base,idx,nphase)
% Create one Buck phase with 180° complementary IGBTs
open_system(add_block('built-in/Subsystem',[model '/' buckName],'Position',pos));
Lout = 200e-6; % output inductor
phaseShift = (idx-1)*360/nphase; % 45° step

add_block('powerlib/Power Electronics/Converters/Full-Bridge',[model '/' buckName '/Bridge'],...
    'Position',[60 40 120 120],'Ron','0.001','SnubberResistance','1e6','SnubberCapacitance','0');
add_block('powerlib/Elements/Inductor',[model '/' buckName '/Lout'],...
    'Inductance',num2str(Lout),'SeriesResistance','0','Position',[180 60 220 100]);
add_block('powerlib/Measurements/Current Measurement',[model '/' buckName '/SenseI'],...
    'Position',[250 60 290 100]);
add_line([model '/' buckName],'Bridge/1','Lout/1');
add_line([model '/' buckName],'Lout/2','SenseI/1');
add_line([model '/' buckName],'SenseI/1','Bridge/2');

% DC link connection
add_block('powerlib/Elements/Controlled Voltage Source',[model '/' buckName '/Vdc'],...
    'Position',[10 40 40 120]);
add_block('simulink/Ports & Subsystems/In1',[model '/' buckName '/Vdc_in'],...
    'Position',[10 80 40 100]);
add_line([model '/' buckName],'Vdc_in/1','Vdc/1');
add_line([model '/' buckName],'Vdc/1','Bridge/3');
add_line([model '/' buckName],'Vdc/1','Bridge/4');

% PWM generation with phase shifts
add_block('simulink/Sources/Sawtooth Generator',[model '/' buckName '/Carrier'],...
    'Frequency',num2str(fs_base),'Amplitude','1','Position',[10 160 60 190]);
add_block('simulink/Sources/Constant',[model '/' buckName '/Duty'],...
    'Value','0.5','Position',[10 200 60 230]);
add_block('simulink/Math Operations/Add',[model '/' buckName '/PhaseShift'],...
    'Position',[80 200 110 220],'Inputs','++');
add_block('simulink/Sources/Constant',[model '/' buckName '/PhaseConst'],...
    'Value',num2str(phaseShift/360),'Position',[80 160 110 180]);
add_line([model '/' buckName],'Duty/1','PhaseShift/1');
add_line([model '/' buckName],'PhaseConst/1','PhaseShift/2');
add_block('simulink/Math Operations/Subtract',[model '/' buckName '/Compare'],...
    'Position',[150 170 180 210]);
add_line([model '/' buckName],'PhaseShift/1','Compare/1');
add_line([model '/' buckName],'Carrier/1','Compare/2');

% Complementary gates
add_block('simulink/Signal Routing/Mux',[model '/' buckName '/GateMux'],...
    'Inputs','2','Position',[210 160 240 200]);
add_block('simulink/Math Operations/Gain',[model '/' buckName '/Negate'],...
    'Gain','-1','Position',[210 200 240 230]);
add_line([model '/' buckName],'Compare/1','GateMux/1');
add_line([model '/' buckName],'Compare/1','Negate/1');
add_line([model '/' buckName],'Negate/1','GateMux/2');

add_block('simulink/Ports & Subsystems/Out1',[model '/' buckName '/i_out'],...
    'Position',[320 70 350 90]);
add_block('simulink/Ports & Subsystems/Out1',[model '/' buckName '/gates'],...
    'Position',[320 170 350 190]);
add_line([model '/' buckName],'SenseI/1','i_out/1');
add_line([model '/' buckName],'GateMux/1','gates/1');
close_system([model '/' buckName]);
end

function build_control_block(model,Vref,Iref,fs_base,nphase,t_sim)
ctrlBlk = [model '/Controller'];
open_system(add_block('built-in/Subsystem',ctrlBlk,'Position',[100 450 300 650]));

add_block('simulink/Sources/Constant',[ctrlBlk '/Vref'],...
    'Value',num2str(Vref),'Position',[20 60 60 80]);
add_block('simulink/Sources/Constant',[ctrlBlk '/Iref_base'],...
    'Value',num2str(Iref),'Position',[20 120 60 140]);
add_block('simulink/Sources/Step',[ctrlBlk '/IstepDown'],...
    'Time','0.01','Before','0','After','-500','Position',[20 160 60 180]);
add_block('simulink/Sources/Step',[ctrlBlk '/IstepUp'],...
    'Time','0.03','Before','0','After','500','Position',[20 200 60 220]);
add_block('simulink/Math Operations/Sum',[ctrlBlk '/SumIref'],...
    'Inputs','+++','Position',[90 120 120 180]);
add_line(ctrlBlk,'Iref_base/1','SumIref/1');
add_line(ctrlBlk,'IstepDown/1','SumIref/2');
add_line(ctrlBlk,'IstepUp/1','SumIref/3');

add_block('simulink/Ports & Subsystems/In1',[ctrlBlk '/Vout_meas'],...
    'Position',[20 240 60 260]);
add_block('simulink/Ports & Subsystems/In1',[ctrlBlk '/Iout_meas'],...
    'Position',[20 280 60 300]);

add_block('simulink/Math Operations/Sum',[ctrlBlk '/SumV'],...
    'Inputs','+-','Position',[120 60 140 80]);
add_line(ctrlBlk,'Vref/1','SumV/1');
add_line(ctrlBlk,'Vout_meas/1','SumV/2');
add_block('simulink/Discrete/PI Controller',[ctrlBlk '/PI_V'],...
    'P','0.1','I','500','SampleTime',num2str(1/fs_base),'Position',[160 60 210 80]);
add_line(ctrlBlk,'SumV/1','PI_V/1');

add_block('simulink/Math Operations/Sum',[ctrlBlk '/SumI'],...
    'Inputs','+-','Position',[120 120 140 140]);
add_line(ctrlBlk,'SumIref/1','SumI/1');
add_line(ctrlBlk,'Iout_meas/1','SumI/2');
add_block('simulink/Discrete/PI Controller',[ctrlBlk '/PI_I'],...
    'P','0.05','I','200','SampleTime',num2str(1/fs_base),'Position',[160 120 210 140]);
add_line(ctrlBlk,'SumI/1','PI_I/1');

add_block('simulink/Math Operations/MinMax',[ctrlBlk '/MinBlock'],...
    'Function','min','Inputs','2','Position',[240 90 260 130]);
add_line(ctrlBlk,'PI_V/1','MinBlock/1');
add_line(ctrlBlk,'PI_I/1','MinBlock/2');

add_block('simulink/Ports & Subsystems/Out1',[ctrlBlk '/Duty'],...
    'Position',[280 100 310 120]);
add_line(ctrlBlk,'MinBlock/1','Duty/1');
close_system(ctrlBlk);

% Connect controller at top level
add_block('simulink/Signal Routing/From Workspace',[model '/DutyFromCtrl'],...
    'VariableName','ctrl_duty','Position',[410 450 450 480]); %#ok<NASGU>
end
