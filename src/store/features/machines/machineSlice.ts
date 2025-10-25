// src/store/features/machines/machineSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Machine {
	_id: string;
	machineName: string;
	urlFor404Api: string;
	localIpAddress: string;
	nginxStoragePathOptions: string[];
}

export interface MachineState {
	machinesArray: Machine[];
	connectedMachine: Machine | null;
}

const initialState: MachineState = {
	machinesArray: [],
	connectedMachine: null,
};

export const machineSlice = createSlice({
	name: "machine",
	initialState,
	reducers: {
		setMachinesArray: (state, action: PayloadAction<Machine[]>) => {
			state.machinesArray = action.payload;
		},

		connectMachine: (state, action: PayloadAction<Machine>) => {
			state.connectedMachine = action.payload;
		},

		disconnectMachine: (state) => {
			state.connectedMachine = null;
		},

		clearMachines: (state) => {
			state.machinesArray = [];
			state.connectedMachine = null;
		},
	},
});

export const {
	setMachinesArray,
	connectMachine,
	disconnectMachine,
	clearMachines,
} = machineSlice.actions;

export default machineSlice.reducer;
