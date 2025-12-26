"use client";
import React, { useState, useEffect, useCallback } from "react";
import TableMachineServices from "@/components/tables/TableMachineServices";
import { Service, ServicesResponse } from "@/types/service";
import { useAppSelector } from "@/store/hooks";

export default function ServicesPage() {
	const [services, setServices] = useState<Service[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const token = useAppSelector((state) => state.user.token);

	const fetchServices = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_EXTERNAL_API_BASE_URL}/services`,
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
	}, [token]);

	useEffect(() => {
		fetchServices();
	}, [fetchServices]);

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

			{/* Error State */}
			{error && !loading && (
				<div className="bg-error-50 dark:bg-error-900/20 border border-error-500 rounded-lg p-4">
					<p className="text-error-700 dark:text-error-400">{error}</p>
				</div>
			)}

			{/* Services Table */}
			{!loading && !error && <TableMachineServices data={services} />}
		</div>
	);
}
