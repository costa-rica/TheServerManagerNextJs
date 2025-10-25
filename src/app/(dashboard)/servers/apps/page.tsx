"use client";
import React, { useState, useEffect, useCallback } from "react";
import TablePm2ManagedApps from "@/components/tables/TablePm2ManagedApps";
import { mockPm2AppsData } from "@/data/mockPm2Apps";
import { Modal } from "@/components/ui/modal";
import { ModalInformationYesOrNo } from "@/components/ui/modal/ModalInformationYesOrNo";
import { ModalInformationOk } from "@/components/ui/modal/ModalInformationOk";
import { ModalPm2AppLogs } from "@/components/ui/modal/ModalPm2AppLogs";
import { Pm2App } from "@/types/pm2App";
import { useAppSelector } from "@/store/hooks";

export default function AppsPage() {
	const [toggleModalOpen, setToggleModalOpen] = useState(false);
	const [infoModalOpen, setInfoModalOpen] = useState(false);
	const [logsModalOpen, setLogsModalOpen] = useState(false);
	const [selectedAppForLogs, setSelectedAppForLogs] = useState<string | null>(
		null
	);
	const [infoModalData, setInfoModalData] = useState<{
		title: string;
		message: string;
		variant: "info" | "success" | "error" | "warning";
	}>({
		title: "",
		message: "",
		variant: "info",
	});
	const [appToToggle, setAppToToggle] = useState<{
		name: string;
		currentStatus: string;
	} | null>(null);
	const [apps, setApps] = useState<Pm2App[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const token = useAppSelector((state) => state.user.token);
	const urlFor404Api = useAppSelector(
		(state) => state.machine.connectedMachine?.urlFor404Api || null
	);

	const showInfoModal = (
		title: string,
		message: string,
		variant: "info" | "success" | "error" | "warning" = "info"
	) => {
		setInfoModalData({ title, message, variant });
		setInfoModalOpen(true);
	};

	const fetchApps = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			// Check if we're in mock data mode
			if (process.env.NEXT_PUBLIC_MODE === "mock_data") {
				// Use mock data
				setApps(mockPm2AppsData.managedAppsArray);
				setLoading(false);
			} else {
				// Check if a machine is connected
				if (!urlFor404Api) {
					setError("No machine connected. Please connect to a machine first.");
					setLoading(false);
					return;
				}

				// Fetch from API
				const response = await fetch(`${urlFor404Api}/pm2/apps`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				});

				if (!response.ok) {
					throw new Error(
						`Failed to fetch apps: ${response.status} ${response.statusText}`
					);
				}

				const data = await response.json();

				if (Array.isArray(data.managedAppsArray)) {
					setApps(data.managedAppsArray);
				} else {
					throw new Error("Invalid response format from API");
				}

				setLoading(false);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to fetch apps");
			setLoading(false);
		}
	}, [token, urlFor404Api]);

	useEffect(() => {
		fetchApps();
	}, [fetchApps]);

	const handleViewLogsClick = (appName: string) => {
		setSelectedAppForLogs(appName);
		setLogsModalOpen(true);
	};

	const handleToggleStatusClick = (appName: string, currentStatus: string) => {
		setAppToToggle({ name: appName, currentStatus });
		setToggleModalOpen(true);
	};

	const handleToggleStatusConfirm = async () => {
		if (!appToToggle) return;

		console.log(`Toggling ${appToToggle.name}...`);

		try {
			if (process.env.NEXT_PUBLIC_MODE === "mock_data") {
				// Mock mode: just update local state
				setApps((prevApps) =>
					prevApps.map((app) =>
						app.name === appToToggle.name
							? {
									...app,
									status: app.status === "online" ? "stopped" : "online",
							  }
							: app
					)
				);
				setToggleModalOpen(false);
				setAppToToggle(null);
				showInfoModal(
					"Status Changed",
					`Successfully toggled ${appToToggle.name}`,
					"success"
				);
			} else {
				if (!urlFor404Api) {
					showInfoModal("Error", "No machine connected", "error");
					return;
				}

				const response = await fetch(
					`${urlFor404Api}/pm2/toggle-app-status/${appToToggle.name}`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
					}
				);

				console.log("Received response:", response.status);

				let resJson = null;
				const contentType = response.headers.get("Content-Type");

				if (contentType?.includes("application/json")) {
					resJson = await response.json();
				}

				if (response.ok) {
					console.log("Status toggled successfully:", resJson);

					// Update local state with the new status from API response
					if (resJson.app && resJson.app.status) {
						setApps((prevApps) =>
							prevApps.map((app) =>
								app.name === appToToggle.name
									? { ...app, status: resJson.app.status }
									: app
							)
						);
					}

					setToggleModalOpen(false);
					setAppToToggle(null);
					showInfoModal("Status Changed", resJson.message || "App status toggled successfully", "success");
				} else {
					const errorMessage =
						resJson?.error || `There was a server error: ${response.status}`;
					setToggleModalOpen(false);
					setAppToToggle(null);
					showInfoModal("Error", errorMessage, "error");
				}
			}
		} catch (error) {
			console.error("Error toggling app status:", error);
			setToggleModalOpen(false);
			setAppToToggle(null);
			showInfoModal(
				"Error",
				error instanceof Error ? error.message : "Failed to toggle app status",
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
						PM2 Managed Apps
					</h1>
					<p className="mt-2 text-gray-600 dark:text-gray-400">
						View and manage apps running on the connected server
					</p>
				</div>
			</div>

			{/* Loading State */}
			{loading && (
				<div className="text-center py-12">
					<p className="text-gray-500 dark:text-gray-400">Loading apps...</p>
				</div>
			)}

			{/* Error State */}
			{error && !loading && (
				<div className="bg-error-50 dark:bg-error-900/20 border border-error-500 rounded-lg p-4">
					<p className="text-error-700 dark:text-error-400">{error}</p>
				</div>
			)}

			{/* Apps Table */}
			{!loading && !error && (
				<TablePm2ManagedApps
					data={apps}
					handleToggleStatus={handleToggleStatusClick}
					handleViewLogs={handleViewLogsClick}
				/>
			)}

			{/* Toggle Status Confirmation Modal */}
			<Modal
				isOpen={toggleModalOpen}
				onClose={() => {
					setToggleModalOpen(false);
					setAppToToggle(null);
				}}
			>
				<ModalInformationYesOrNo
					title="Toggle App Status"
					message={`Are you sure you want to ${
						appToToggle?.currentStatus === "online" ? "stop" : "start"
					} "${appToToggle?.name}"?`}
					onYes={handleToggleStatusConfirm}
					onClose={() => {
						setToggleModalOpen(false);
						setAppToToggle(null);
					}}
					yesButtonText="Toggle"
					noButtonText="Cancel"
					yesButtonStyle="primary"
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

			{/* Logs Modal */}
			<Modal
				isOpen={logsModalOpen}
				onClose={() => {
					setLogsModalOpen(false);
					setSelectedAppForLogs(null);
				}}
				className="max-w-none"
			>
				{selectedAppForLogs && (
					<ModalPm2AppLogs
						appName={selectedAppForLogs}
						onClose={() => {
							setLogsModalOpen(false);
							setSelectedAppForLogs(null);
						}}
					/>
				)}
			</Modal>
		</div>
	);
}
