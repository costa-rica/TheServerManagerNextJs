"use client";
import React, { useState } from "react";
import MachineSelect from "@/components/form/MachineSelect";
import { Machine } from "@/store/features/machines/machineSlice";

interface NginxFormState {
	nginxHostMachine: Machine | null;
	appHostMachine: Machine | null;
	serverNames: string[];
	port: string;
	framework: string;
	storeDirectory: string;
}

export default function NginxPage() {
	const [formState, setFormState] = useState<NginxFormState>({
		nginxHostMachine: null,
		appHostMachine: null,
		serverNames: [],
		port: "",
		framework: "",
		storeDirectory: "",
	});

	const handleNginxHostChange = (machine: Machine | null) => {
		setFormState((prev) => ({ ...prev, nginxHostMachine: machine }));
	};

	const handleAppHostChange = (machine: Machine | null) => {
		setFormState((prev) => ({ ...prev, appHostMachine: machine }));
	};

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div className="flex items-start justify-between">
				<div>
					<h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
						Nginx Configuration
					</h1>
					<p className="mt-2 text-gray-600 dark:text-gray-400">
						Create and manage Nginx server configuration files
					</p>
				</div>
			</div>

			{/* Form Container */}
			<div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
				<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
					Create New Configuration
				</h2>
				<form className="space-y-6">
					{/* Nginx Host Machine */}
					<div>
						<MachineSelect
							label="Nginx Host Machine"
							placeholder="Select the machine hosting Nginx"
							onChange={handleNginxHostChange}
						/>
					</div>

					{/* App Host Machine */}
					<div>
						<MachineSelect
							label="App Host Machine"
							placeholder="Select the machine hosting the application"
							onChange={handleAppHostChange}
						/>
					</div>

					{/* Placeholder for additional form fields */}
					<div className="text-gray-500 dark:text-gray-400 text-sm italic">
						Additional form fields will be added in subsequent cards...
					</div>
				</form>
			</div>

			{/* Table Container */}
			<div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
				<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
					Existing Configurations
				</h2>
				<div className="text-gray-500 dark:text-gray-400">
					Table will be implemented here
				</div>
			</div>
		</div>
	);
}
