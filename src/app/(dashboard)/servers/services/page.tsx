"use client";
import React, { useState, useEffect, useCallback } from "react";
import TableMachineServices from "@/components/tables/TableMachineServices";
import { Service, ServicesResponse } from "@/types/service";
import { useAppSelector } from "@/store/hooks";
import { Modal } from "@/components/ui/modal";
import { ModalServiceLog } from "@/components/ui/modal/ModalServiceLog";

export default function ServicesPage() {
	const [services, setServices] = useState<Service[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isLogModalOpen, setIsLogModalOpen] = useState(false);
	const [selectedServiceName, setSelectedServiceName] = useState<string | null>(null);
	const token = useAppSelector((state) => state.user.token);
	const connectedMachine = useAppSelector((state) => state.machine.connectedMachine);

	const fetchServices = useCallback(async () => {
		if (!connectedMachine) {
			setServices([]);
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const response = await fetch(
				`${connectedMachine.urlFor404Api}/services`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (!response.ok) {
				const errorData = await response.json().catch(() => null);
				throw new Error(
					errorData?.error ||
						`Failed to fetch services: ${response.status} ${response.statusText}`
				);
			}

			const data: ServicesResponse = await response.json();

			if (data.servicesStatusArray && Array.isArray(data.servicesStatusArray)) {
				setServices(data.servicesStatusArray);
			} else {
				throw new Error("Invalid response format from API");
			}

			setLoading(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to fetch services");
			setLoading(false);
		}
	}, [connectedMachine, token]);

	useEffect(() => {
		fetchServices();
	}, [fetchServices]);

	const handleViewLogs = (serviceName: string) => {
		setSelectedServiceName(serviceName);
		setIsLogModalOpen(true);
	};

	const handleToggleStatus = async (
		serviceFilename: string,
		toggleStatus: string,
		serviceName: string
	) => {
		if (!connectedMachine) {
			setError("No machine connected. Please connect to a machine first.");
			return;
		}

		try {
			const response = await fetch(
				`${connectedMachine.urlFor404Api}/services/${serviceFilename}/${toggleStatus}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (!response.ok) {
				const errorData = await response.json().catch(() => null);
				throw new Error(
					errorData?.error?.message ||
						errorData?.error ||
						`Failed to ${toggleStatus} service: ${response.status} ${response.statusText}`
				);
			}

			// Refresh services list after successful toggle
			await fetchServices();
		} catch (err) {
			console.error("Error toggling service:", err);
			setError(
				err instanceof Error
					? err.message
					: `Failed to ${toggleStatus} service ${serviceName}`
			);
		}
	};

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div className="flex items-start justify-between">
				<div>
					<h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
						Services
					</h1>
					<p className="mt-2 text-gray-600 dark:text-gray-400">
						Monitor and manage systemd services on your server
					</p>
				</div>
			</div>

			{/* Loading State */}
			{loading && (
				<div className="text-center py-12">
					<p className="text-gray-500 dark:text-gray-400">
						Loading services...
					</p>
				</div>
			)}

			{/* No Machine Connected State */}
			{!loading && !connectedMachine && (
				<div className="text-center py-12">
					<p className="text-gray-500 dark:text-gray-400">
						Please connect to a machine to view services
					</p>
				</div>
			)}

			{/* Error State */}
			{error && !loading && connectedMachine && (
				<div className="bg-error-50 dark:bg-error-900/20 border border-error-500 rounded-lg p-4">
					<p className="text-error-700 dark:text-error-400">{error}</p>
				</div>
			)}

			{/* Services Table */}
			{!loading && !error && connectedMachine && (
				<TableMachineServices
					data={services}
					handleViewLogs={handleViewLogs}
					handleToggleStatus={handleToggleStatus}
				/>
			)}

			{/* Service Log Modal */}
			{selectedServiceName && (
				<Modal
					isOpen={isLogModalOpen}
					onClose={() => {
						setIsLogModalOpen(false);
						setSelectedServiceName(null);
					}}
					isFullscreen={true}
					showCloseButton={true}
				>
					<ModalServiceLog
						serviceName={selectedServiceName}
						onClose={() => {
							setIsLogModalOpen(false);
							setSelectedServiceName(null);
						}}
					/>
				</Modal>
			)}
		</div>
	);
}
