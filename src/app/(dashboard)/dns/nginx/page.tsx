"use client";
import React, { useState } from "react";
import MachineSelect from "@/components/form/MachineSelect";
import { Machine } from "@/store/features/machines/machineSlice";
import { Modal } from "@/components/ui/modal";
import { ModalInformationYesOrNo } from "@/components/ui/modal/ModalInformationYesOrNo";
import { ModalInformationOk } from "@/components/ui/modal/ModalInformationOk";
import { useAppSelector } from "@/store/hooks";

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
		serverNames: [""],
		port: "",
		framework: "",
		storeDirectory: "",
	});

	const [serverNameErrors, setServerNameErrors] = useState<string[]>([""]);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [infoModalOpen, setInfoModalOpen] = useState(false);
	const [infoModalData, setInfoModalData] = useState<{
		title: string;
		message: string;
		variant: "info" | "success" | "error" | "warning";
	}>({
		title: "",
		message: "",
		variant: "info",
	});

	const token = useAppSelector((state) => state.user.token);
	const connectedMachine = useAppSelector((state) => state.machine.connectedMachine);

	const handleNginxHostChange = (machine: Machine | null) => {
		setFormState((prev) => ({ ...prev, nginxHostMachine: machine }));
	};

	const handleAppHostChange = (machine: Machine | null) => {
		setFormState((prev) => ({ ...prev, appHostMachine: machine }));
	};

	// Validate domain/subdomain format
	const validateServerName = (value: string): string => {
		if (!value.trim()) {
			return "";
		}
		// Basic domain/subdomain validation
		const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
		if (!domainRegex.test(value)) {
			return "Invalid domain/subdomain format";
		}
		return "";
	};

	const handleServerNameChange = (index: number, value: string) => {
		const newServerNames = [...formState.serverNames];
		newServerNames[index] = value;
		setFormState((prev) => ({ ...prev, serverNames: newServerNames }));

		// Validate
		const newErrors = [...serverNameErrors];
		newErrors[index] = validateServerName(value);
		setServerNameErrors(newErrors);
	};

	const addServerName = () => {
		setFormState((prev) => ({
			...prev,
			serverNames: [...prev.serverNames, ""],
		}));
		setServerNameErrors([...serverNameErrors, ""]);
	};

	const removeServerName = (index: number) => {
		if (formState.serverNames.length > 1) {
			const newServerNames = formState.serverNames.filter((_, i) => i !== index);
			const newErrors = serverNameErrors.filter((_, i) => i !== index);
			setFormState((prev) => ({ ...prev, serverNames: newServerNames }));
			setServerNameErrors(newErrors);
		}
	};

	const showInfoModal = (
		title: string,
		message: string,
		variant: "info" | "success" | "error" | "warning" = "info"
	) => {
		setInfoModalData({ title, message, variant });
		setInfoModalOpen(true);
	};

	const handleDeleteTableClick = () => {
		if (!connectedMachine) {
			showInfoModal(
				"No Machine Connected",
				"Please connect to a machine before clearing the table.",
				"warning"
			);
			return;
		}
		setDeleteModalOpen(true);
	};

	const handleDeleteTableConfirm = async () => {
		if (!connectedMachine) return;

		try {
			const response = await fetch(
				`${connectedMachine.urlFor404Api}/nginx/clear`,
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				}
			);

			let resJson = null;
			const contentType = response.headers.get("Content-Type");

			if (contentType?.includes("application/json")) {
				resJson = await response.json();
			}

			if (response.ok) {
				setDeleteModalOpen(false);
				showInfoModal(
					"Table Cleared",
					`Successfully cleared ${resJson?.deletedCount || 0} nginx configuration records from the database on ${connectedMachine.machineName}.`,
					"success"
				);
			} else {
				const errorMessage =
					resJson?.error || `Server error: ${response.status}`;
				setDeleteModalOpen(false);
				showInfoModal("Error", errorMessage, "error");
			}
		} catch (error) {
			setDeleteModalOpen(false);
			showInfoModal(
				"Error",
				error instanceof Error ? error.message : "Failed to clear nginx files",
				"error"
			);
		}
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
				<div className="flex gap-3">
					<button
						onClick={handleDeleteTableClick}
						className="px-4 py-2 bg-error-500 hover:bg-error-600 dark:bg-error-600 dark:hover:bg-error-700 text-white rounded-lg font-medium transition-colors"
					>
						Delete Table
					</button>
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

					{/* Server Names */}
					<div>
						<label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
							Server Names
						</label>
						<div className="space-y-3">
							{formState.serverNames.map((serverName, index) => (
								<div key={index} className="flex items-start gap-2">
									<div className="flex-1">
										<input
											type="text"
											value={serverName}
											onChange={(e) => handleServerNameChange(index, e.target.value)}
											placeholder={
												index === 0
													? "Primary server name (e.g., example.com)"
													: "Additional server name"
											}
											className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 ${
												serverNameErrors[index]
													? "border-error-300 focus:border-error-300 focus:ring-error-500/10 dark:border-error-700 dark:focus:border-error-800"
													: "border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800"
											} dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30`}
										/>
										{serverNameErrors[index] && (
											<p className="mt-1 text-xs text-error-600 dark:text-error-400">
												{serverNameErrors[index]}
											</p>
										)}
									</div>
									{formState.serverNames.length > 1 && (
										<button
											type="button"
											onClick={() => removeServerName(index)}
											className="mt-1.5 h-8 w-8 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-error-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-error-400"
											title="Remove server name"
										>
											×
										</button>
									)}
								</div>
							))}
						</div>
						<button
							type="button"
							onClick={addServerName}
							className="mt-3 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
						>
							<span className="text-lg leading-none">+</span>
							Add Additional Server Name
						</button>
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

			{/* Delete Confirmation Modal */}
			<Modal
				isOpen={deleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
			>
				<ModalInformationYesOrNo
					title="Clear Nginx Configuration Table"
					message="Are you sure you want to clear all nginx configuration records from the database? This will remove all entries from the NginxFiles collection but will NOT delete the actual nginx configuration files from the filesystem. This action cannot be undone."
					onYes={handleDeleteTableConfirm}
					onClose={() => setDeleteModalOpen(false)}
					yesButtonText="Clear Table"
					noButtonText="Cancel"
					yesButtonStyle="danger"
				/>
			</Modal>

			{/* Information Modal */}
			<Modal isOpen={infoModalOpen} onClose={() => setInfoModalOpen(false)}>
				<ModalInformationOk
					title={infoModalData.title}
					message={infoModalData.message}
					variant={infoModalData.variant}
					onClose={() => setInfoModalOpen(false)}
				/>
			</Modal>
		</div>
	);
}
