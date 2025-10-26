"use client";
import React from "react";

export default function NginxPage() {
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
				<div className="text-gray-500 dark:text-gray-400">
					Form will be implemented here
				</div>
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
