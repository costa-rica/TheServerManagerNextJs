"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "@/store/hooks";
import TableSubdomains, { Subdomain } from "@/components/tables/TableSubdomains";
import { Modal } from "@/components/ui/modal";
import { ModalInformationYesOrNo } from "@/components/ui/modal/ModalInformationYesOrNo";
import { ModalInformationOk } from "@/components/ui/modal/ModalInformationOk";

export default function RegistrarPage() {
	const [subdomains, setSubdomains] = useState<Subdomain[]>([]);
	const [loadingSubdomains, setLoadingSubdomains] = useState(true);
	const [deleteSubdomainModalOpen, setDeleteSubdomainModalOpen] = useState(false);
	const [subdomainToDelete, setSubdomainToDelete] = useState<{
		id: string;
		name: string;
	} | null>(null);
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

	// Fetch subdomains on mount and when connected machine changes
	const fetchSubdomains = useCallback(async () => {
		if (!connectedMachine) {
			setSubdomains([]);
			setLoadingSubdomains(false);
			return;
		}

		setLoadingSubdomains(true);

		try {
			// TODO: Replace with actual API endpoint once backend is ready
			const response = await fetch(
				`${connectedMachine.urlFor404Api}/porkbun/subdomains`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.ok) {
				const data = await response.json();
				setSubdomains(Array.isArray(data) ? data : []);
			} else {
				console.error("Failed to fetch subdomains");
				setSubdomains([]);
			}
		} catch (error) {
			console.error("Error fetching subdomains:", error);
			setSubdomains([]);
		} finally {
			setLoadingSubdomains(false);
		}
	}, [connectedMachine, token]);

	useEffect(() => {
		fetchSubdomains();
	}, [fetchSubdomains]);

	const showInfoModal = (
		title: string,
		message: string,
		variant: "info" | "success" | "error" | "warning" = "info"
	) => {
		setInfoModalData({ title, message, variant });
		setInfoModalOpen(true);
	};

	const handleDeleteSubdomainClick = (subdomainId: string, subdomainName: string) => {
		setSubdomainToDelete({ id: subdomainId, name: subdomainName });
		setDeleteSubdomainModalOpen(true);
	};

	const handleDeleteSubdomainConfirm = async () => {
		if (!subdomainToDelete || !connectedMachine) return;

		try {
			// TODO: Replace with actual API endpoint once backend is ready
			const response = await fetch(
				`${connectedMachine.urlFor404Api}/porkbun/subdomains/${subdomainToDelete.id}`,
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
				setDeleteSubdomainModalOpen(false);
				setSubdomainToDelete(null);

				// Refresh subdomains list
				fetchSubdomains();

				showInfoModal(
					"Subdomain Deleted",
					`Successfully deleted subdomain ${subdomainToDelete.name}`,
					"success"
				);
			} else {
				const errorMessage = resJson?.error || `Server error: ${response.status}`;
				setDeleteSubdomainModalOpen(false);
				setSubdomainToDelete(null);
				showInfoModal("Error", errorMessage, "error");
			}
		} catch (error) {
			setDeleteSubdomainModalOpen(false);
			setSubdomainToDelete(null);
			showInfoModal(
				"Error",
				error instanceof Error ? error.message : "Failed to delete subdomain",
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
						Porkbun Registrar
					</h1>
					<p className="mt-2 text-gray-600 dark:text-gray-400">
						Manage DNS records through Porkbun API
					</p>
				</div>
			</div>

			{/* Form Container */}
			<div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
				<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
					Create New DNS Record
				</h2>
				<div className="text-center py-12">
					<p className="text-gray-500 dark:text-gray-400">
						Form implementation coming soon...
					</p>
				</div>
			</div>

			{/* Table Container */}
			<div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
				<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
					Existing DNS Records
				</h2>
				{loadingSubdomains ? (
					<div className="text-center py-12">
						<p className="text-gray-500 dark:text-gray-400">
							Loading DNS records...
						</p>
					</div>
				) : !connectedMachine ? (
					<div className="text-center py-12">
						<p className="text-gray-500 dark:text-gray-400">
							Please connect to a machine to view DNS records
						</p>
					</div>
				) : (
					<TableSubdomains
						data={subdomains}
						handleDeleteSubdomain={handleDeleteSubdomainClick}
					/>
				)}
			</div>

			{/* Delete Subdomain Modal */}
			<Modal
				isOpen={deleteSubdomainModalOpen}
				onClose={() => {
					setDeleteSubdomainModalOpen(false);
					setSubdomainToDelete(null);
				}}
			>
				<ModalInformationYesOrNo
					title="Delete DNS Record"
					message={`Are you sure you want to delete the DNS record "${subdomainToDelete?.name}"? This action cannot be undone.`}
					onYes={handleDeleteSubdomainConfirm}
					onClose={() => {
						setDeleteSubdomainModalOpen(false);
						setSubdomainToDelete(null);
					}}
					yesButtonText="Delete"
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
