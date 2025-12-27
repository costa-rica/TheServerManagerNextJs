"use client";
import React, { useState } from "react";
import { ChevronDownIcon } from "@/icons";

interface ModalMachineAddProps {
  onClose: () => void;
  onSubmit: (machineData: {
    urlFor404Api: string;
    nginxStoragePathOptions: string[];
    serviceFilename: string;
  }) => void;
}

export const ModalMachineAdd: React.FC<ModalMachineAddProps> = ({
  onClose,
  onSubmit,
}) => {
  const [serviceFilename, setServiceFilename] = useState("");
  const [urlFor404Api, setUrlFor404Api] = useState("");
  const [nginxPaths, setNginxPaths] = useState<string[]>([
    "/etc/nginx/sites-available",
    "/etc/nginx/conf.d",
  ]);
  const [isNginxPathsExpanded, setIsNginxPathsExpanded] = useState(false);

  const handleAddPath = () => {
    setNginxPaths([...nginxPaths, ""]);
  };

  const handleRemovePath = (index: number) => {
    setNginxPaths(nginxPaths.filter((_, i) => i !== index));
  };

  const handlePathChange = (index: number, value: string) => {
    const newPaths = [...nginxPaths];
    newPaths[index] = value;
    setNginxPaths(newPaths);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!serviceFilename.trim() || !urlFor404Api.trim()) {
      // Just prevent submission - user will see empty required fields
      return;
    }

    // Ensure URL has protocol (add https:// if missing)
    let apiUrl = urlFor404Api.trim();
    if (!apiUrl.startsWith("http://") && !apiUrl.startsWith("https://")) {
      apiUrl = `https://${apiUrl}`;
    }

    // Remove trailing slash(es)
    apiUrl = apiUrl.replace(/\/+$/, "");

    // Filter out empty nginx paths
    const filteredPaths = nginxPaths.filter((path) => path.trim() !== "");

    onSubmit({
      urlFor404Api: apiUrl,
      nginxStoragePathOptions: filteredPaths,
      serviceFilename: serviceFilename.trim(),
    });
  };

  return (
    <div className="p-6 sm:p-8">
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Add New Machine
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Configure a new Ubuntu server to monitor and manage
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Service File Filename */}
        <div>
          <label
            htmlFor="serviceFilename"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Service file filename <span className="text-error-500">*</span>
          </label>
          <input
            type="text"
            id="serviceFilename"
            value={serviceFilename}
            onChange={(e) => setServiceFilename(e.target.value)}
            placeholder="e.g., api-name.service"
            className="w-full px-4 py-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
          />
        </div>

        {/* API URL */}
        <div>
          <label
            htmlFor="urlFor404Api"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            API URL <span className="text-error-500">*</span>
          </label>
          <input
            type="text"
            id="urlFor404Api"
            value={urlFor404Api}
            onChange={(e) => setUrlFor404Api(e.target.value)}
            placeholder="e.g., https://maestro03.the404api.dashanddata.com"
            className="w-full px-4 py-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
          />
        </div>

        {/* Nginx Storage Path Options - Collapsible */}
        <div>
          <div
            className="flex items-center gap-2 cursor-pointer mb-2"
            onClick={() => setIsNginxPathsExpanded(!isNginxPathsExpanded)}
          >
            <ChevronDownIcon
              className={`w-5 h-5 transition-transform duration-200 text-gray-700 dark:text-gray-300 ${
                isNginxPathsExpanded ? "rotate-180" : ""
              }`}
            />
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              Nginx Storage Paths
            </label>
          </div>

          {isNginxPathsExpanded && (
            <div className="space-y-2">
              {nginxPaths.map((path, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={path}
                    onChange={(e) => handlePathChange(index, e.target.value)}
                    placeholder="e.g., /etc/nginx/conf.d"
                    className="flex-1 px-4 py-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                  />
                  {nginxPaths.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePath(index)}
                      className="px-3 py-2 bg-error-100 hover:bg-error-200 dark:bg-error-900/20 dark:hover:bg-error-900/30 text-error-700 dark:text-error-400 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddPath}
                className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-500 font-medium transition-colors"
              >
                + Add another path
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-brand-500 hover:bg-brand-600 dark:bg-brand-400 dark:hover:bg-brand-500 text-white rounded-lg font-medium transition-colors"
          >
            Add Machine
          </button>
        </div>
      </form>
    </div>
  );
};
