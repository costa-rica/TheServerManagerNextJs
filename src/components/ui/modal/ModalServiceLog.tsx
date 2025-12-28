"use client";
import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";

interface ModalServiceLogProps {
	serviceName: string;
	onClose: () => void;
}

export const ModalServiceLog: React.FC<ModalServiceLogProps> = ({
	serviceName,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onClose: _onClose,
}) => {
	const [logs, setLogs] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const token = useAppSelector((state) => state.user.token);
	const connectedMachine = useAppSelector((state) => state.machine.connectedMachine);

	// Fetch logs function
	useEffect(() => {
		const fetchLogs = async () => {
			if (!connectedMachine) {
				setError("No machine connected");
				setLoading(false);
				return;
			}

			setLoading(true);
			setError(null);

			try {
				// URL encode the service name to handle spaces
				const encodedServiceName = encodeURIComponent(serviceName);
				const response = await fetch(
					`${connectedMachine.urlFor404Api}/services/logs/${encodedServiceName}`,
					{
						method: "GET",
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (!response.ok) {
					const errorData = await response.json().catch(() => null);
					throw new Error(
						errorData?.error ||
							`Failed to fetch logs: ${response.status} ${response.statusText}`
					);
				}

				// Response is plain text
				const logText = await response.text();
				setLogs(logText);
				setLoading(false);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to fetch logs");
				setLoading(false);
			}
		};

		fetchLogs();
	}, [serviceName, token, connectedMachine]);

	return (
		<div className="flex flex-col w-[95vw] h-[95vh] bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
			{/* Header */}
			<div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
				<h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
					Service Logs: {serviceName}
				</h2>
			</div>

			{/* Log Content */}
			<div className="flex-1 overflow-auto p-6 bg-gray-950 dark:bg-black">
				{loading && (
					<p className="text-gray-400">Loading logs...</p>
				)}

				{error && (
					<div className="p-4 bg-error-50 dark:bg-error-900/20 border border-error-500 rounded-lg">
						<p className="text-error-700 dark:text-error-400">{error}</p>
					</div>
				)}

				{!error && !loading && logs && (
					<pre className="text-sm text-success-400 font-mono whitespace-pre-wrap break-words select-text">
						{logs}
					</pre>
				)}

				{!error && !loading && !logs && (
					<p className="text-gray-400">No logs available</p>
				)}
			</div>
		</div>
	);
};
