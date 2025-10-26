"use client";
import React, { useMemo, useState } from "react";
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
	ColumnDef,
	getSortedRowModel,
	getFilteredRowModel,
	SortingState,
	FilterFn,
} from "@tanstack/react-table";

interface NginxFile {
	_id: string;
	serverName: string;
	portNumber: number;
	serverNameArrayOfAdditionalServerNames: string[];
	appHostServerMachineId: {
		_id: string;
		machineName: string;
		urlFor404Api: string;
		localIpAddress: string;
		userHomeDir: string;
		nginxStoragePathOptions: string[];
		createdAt: string;
		updatedAt: string;
		__v: number;
	};
	nginxHostServerMachineId: {
		_id: string;
		machineName: string;
		urlFor404Api: string;
		localIpAddress: string;
		userHomeDir: string;
		nginxStoragePathOptions: string[];
		createdAt: string;
		updatedAt: string;
		__v: number;
	};
	framework: string;
	storeDirectory: string;
	createdAt: string;
	updatedAt: string;
	__v: number;
}

interface TableNginxFilesProps {
	data: NginxFile[];
	handleDeleteConfig: (configId: string, serverName: string) => void;
}

// Custom filter function for searching nginx configs
const nginxFilterFn: FilterFn<NginxFile> = (row, columnId, filterValue) => {
	const searchValue = filterValue.toLowerCase();
	const config = row.original;

	return (
		config.serverName?.toLowerCase().includes(searchValue) ||
		config.appHostServerMachineId.localIpAddress
			?.toLowerCase()
			.includes(searchValue) ||
		config.framework?.toLowerCase().includes(searchValue) ||
		config.storeDirectory?.toLowerCase().includes(searchValue) ||
		config.serverNameArrayOfAdditionalServerNames.some((name) =>
			name.toLowerCase().includes(searchValue)
		)
	);
};

export default function TableNginxFiles({
	data,
	handleDeleteConfig,
}: TableNginxFilesProps) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState("");

	const columns = useMemo<ColumnDef<NginxFile>[]>(
		() => [
			{
				accessorKey: "serverName",
				header: "Configuration Details",
				enableSorting: true,
				enableColumnFilter: false,
				cell: (info) => {
					const config = info.row.original;
					return (
						<div className="space-y-2">
							{/* Server Name */}
							<div className="font-medium text-gray-900 dark:text-white text-base">
								{config.serverName}
							</div>

							{/* App Host Details */}
							<div className="space-y-1">
								<div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
									App Host Details
								</div>
								<div className="text-sm text-gray-700 dark:text-gray-300">
									<span className="font-medium">IP:</span>{" "}
									<span className="font-mono">
										{config.appHostServerMachineId.localIpAddress}
									</span>
								</div>
								<div className="text-sm text-gray-700 dark:text-gray-300">
									<span className="font-medium">Port:</span>{" "}
									<span className="font-mono">{config.portNumber}</span>
								</div>

								{/* Additional Server Names */}
								{config.serverNameArrayOfAdditionalServerNames.length > 0 && (
									<div className="text-sm text-gray-700 dark:text-gray-300">
										<span className="font-medium">Additional Names:</span>
										<div className="ml-2 mt-1 space-y-0.5">
											{config.serverNameArrayOfAdditionalServerNames.map(
												(name, idx) => (
													<div key={idx} className="font-mono text-xs">
														• {name}
													</div>
												)
											)}
										</div>
									</div>
								)}

								<div className="text-sm text-gray-700 dark:text-gray-300">
									<span className="font-medium">Store Directory:</span>{" "}
									<span className="font-mono text-xs">
										{config.storeDirectory}
									</span>
								</div>
								<div className="text-sm text-gray-700 dark:text-gray-300">
									<span className="font-medium">Framework:</span>{" "}
									<span className="text-brand-600 dark:text-brand-400">
										{config.framework}
									</span>
								</div>
							</div>
						</div>
					);
				},
			},
			{
				accessorKey: "updatedAt",
				header: "Last Modified",
				enableSorting: true,
				enableColumnFilter: false,
				cell: (info) => {
					const date = new Date(info.getValue() as string);
					return (
						<div className="text-sm text-gray-700 dark:text-gray-300">
							<div>{date.toLocaleDateString()}</div>
							<div className="text-xs text-gray-500 dark:text-gray-400">
								{date.toLocaleTimeString()}
							</div>
						</div>
					);
				},
			},
			{
				id: "delete",
				header: "Delete",
				enableSorting: false,
				enableColumnFilter: false,
				cell: (info) => {
					return (
						<button
							onClick={() =>
								handleDeleteConfig(
									info.row.original._id,
									info.row.original.serverName
								)
							}
							className="px-4 py-2 rounded-lg font-medium transition-colors bg-error-100 hover:bg-error-200 dark:bg-error-900/20 dark:hover:bg-error-900/30 text-error-700 dark:text-error-400"
						>
							Delete
						</button>
					);
				},
			},
		],
		[handleDeleteConfig]
	);

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			globalFilter,
		},
		onSortingChange: setSorting,
		onGlobalFilterChange: setGlobalFilter,
		globalFilterFn: nginxFilterFn,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
	});

	if (data.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500 dark:text-gray-400">
					No nginx configurations found
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Search Input */}
			<div className="flex items-center gap-4">
				<input
					type="text"
					value={globalFilter ?? ""}
					onChange={(e) => setGlobalFilter(e.target.value)}
					placeholder="Search configurations..."
					className="flex-1 px-4 py-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
				/>
			</div>

			{/* Table */}
			<div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
				<table className="w-full">
					<thead className="bg-gray-50 dark:bg-gray-800">
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300"
									>
										{header.isPlaceholder ? null : (
											<div
												className={`flex items-center gap-2 ${
													header.column.getCanSort()
														? "cursor-pointer select-none"
														: ""
												}`}
												onClick={header.column.getToggleSortingHandler()}
											>
												{flexRender(
													header.column.columnDef.header,
													header.getContext()
												)}
												{header.column.getCanSort() && (
													<span className="text-gray-400 dark:text-gray-500">
														{{
															asc: "↑",
															desc: "↓",
														}[header.column.getIsSorted() as string] ?? "↕"}
													</span>
												)}
											</div>
										)}
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody className="bg-white dark:bg-gray-950 divide-y divide-gray-200 dark:divide-gray-800">
						{table.getRowModel().rows.length === 0 ? (
							<tr>
								<td
									colSpan={columns.length}
									className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
								>
									No configurations found
								</td>
							</tr>
						) : (
							table.getRowModel().rows.map((row) => (
								<tr
									key={row.id}
									className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
								>
									{row.getVisibleCells().map((cell) => (
										<td key={cell.id} className="px-6 py-4">
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</td>
									))}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
