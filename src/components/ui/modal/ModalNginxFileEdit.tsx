"use client";

import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { useLoading } from "@/context/LoadingContext";

interface ModalNginxFileEditProps {
  nginxFilePublicId: string;
  serverName: string;
  onClose: () => void;
  onError?: (errorData: {
    code: string;
    message: string;
    details?: string | Record<string, unknown> | Array<unknown>;
    status: number;
  }) => void;
  onSuccess?: (message: string) => void;
}

interface NginxConfigFileResponse {
  content: string;
  filePath: string;
  serverName: string;
}

export const ModalNginxFileEdit: React.FC<ModalNginxFileEditProps> = ({
  nginxFilePublicId,
  serverName,
  onClose,
  onError,
  onSuccess,
}) => {
  const [loadingFile, setLoadingFile] = useState<boolean>(true);
  const [fileContent, setFileContent] = useState<string>("");
  const [originalContent, setOriginalContent] = useState<string>("");
  const [filePath, setFilePath] = useState<string>("");

  const token = useAppSelector((state) => state.user.token);
  const connectedMachine = useAppSelector(
    (state) => state.machine.connectedMachine
  );
  const { showLoading, hideLoading } = useLoading();

  // Fetch nginx config file on mount
  useEffect(() => {
    fetchNginxConfigFile();
  }, [nginxFilePublicId]);

  const fetchNginxConfigFile = async () => {
    if (!connectedMachine) {
      if (onError) {
        onError({
          code: "NO_MACHINE",
          message: "No machine connected",
          details: "Please connect to a machine first",
          status: 400,
        });
      }
      setLoadingFile(false);
      onClose();
      return;
    }

    setLoadingFile(true);

    try {
      const response = await fetch(
        `${connectedMachine.urlApiForTsmNetwork}/nginx/config-file/${nginxFilePublicId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let resJson = null;
      const contentType = response.headers.get("Content-Type");

      if (contentType?.includes("application/json")) {
        resJson = await response.json();
      }

      if (!response.ok) {
        if (
          resJson?.error &&
          resJson.error.code &&
          resJson.error.message &&
          resJson.error.status
        ) {
          if (onError) {
            onError({
              code: resJson.error.code,
              message: resJson.error.message,
              details: resJson.error.details,
              status: resJson.error.status,
            });
          }
        }
        setLoadingFile(false);
        onClose();
        return;
      }

      const data = resJson as NginxConfigFileResponse;
      setFileContent(data.content);
      setOriginalContent(data.content);
      setFilePath(data.filePath);
      setLoadingFile(false);
    } catch (err) {
      if (onError) {
        onError({
          code: "NETWORK_ERROR",
          message:
            err instanceof Error
              ? err.message
              : "Failed to fetch nginx config file",
          details: "Unable to connect to the server",
          status: 0,
        });
      }
      setLoadingFile(false);
      onClose();
    }
  };

  const handleUpdateFile = async () => {
    if (!connectedMachine) return;

    // Check if content has changed
    if (fileContent === originalContent) {
      if (onSuccess) {
        onSuccess(`No changes detected for ${serverName}`);
      }
      return;
    }

    showLoading({
      message: `Updating ${serverName} nginx configuration...`,
      variant: "info",
    });

    try {
      const response = await fetch(
        `${connectedMachine.urlApiForTsmNetwork}/nginx/config-file/${nginxFilePublicId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: fileContent }),
        }
      );

      let resJson = null;
      const contentType = response.headers.get("Content-Type");

      if (contentType?.includes("application/json")) {
        resJson = await response.json();
      }

      hideLoading();

      if (!response.ok) {
        if (
          resJson?.error &&
          resJson.error.code &&
          resJson.error.message &&
          resJson.error.status
        ) {
          if (onError) {
            onError({
              code: resJson.error.code,
              message: resJson.error.message,
              details: resJson.error.details,
              status: resJson.error.status,
            });
          }
        }
        return;
      }

      // Update original content to current content after successful save
      setOriginalContent(fileContent);

      if (onSuccess) {
        onSuccess(
          resJson?.message ||
            `Nginx configuration for ${serverName} updated successfully`
        );
      }
    } catch (err) {
      hideLoading();
      if (onError) {
        onError({
          code: "NETWORK_ERROR",
          message:
            err instanceof Error
              ? err.message
              : `Failed to update nginx config for ${serverName}`,
          details: "Unable to connect to the server",
          status: 0,
        });
      }
    }
  };

  const isModified = fileContent !== originalContent;

  return (
    <div className="flex flex-col w-full h-[85vh] bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Edit Nginx Configuration: {serverName}
        </h2>
        {filePath && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-mono">
            {filePath}
          </p>
        )}
      </div>

      {loadingFile ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            Loading nginx configuration...
          </p>
        </div>
      ) : (
        <>
          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="h-full flex flex-col">
              <div className="mb-3 flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Configuration File
                  {isModified && (
                    <span className="ml-2 text-xs text-warning-600 dark:text-warning-400">
                      (Modified)
                    </span>
                  )}
                </label>
              </div>
              <textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                className="flex-1 w-full px-4 py-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 text-gray-900 dark:text-white font-mono text-sm resize-none"
                spellCheck={false}
              />
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleUpdateFile}
                  disabled={!isModified}
                  className="px-6 py-2 bg-brand-500 hover:bg-brand-600 dark:bg-brand-400 dark:hover:bg-brand-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
