"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import LogViewer from "@/components/LogViewer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface PortMapping {
  HostIp: string;
  HostPort: string;
}

interface NetworkDetail {
  id: string;
  name: string;
  driver: string;
  scope: string;
  created: string;
  ipam: Array<{
    Subnet: string;
    Gateway: string;
    IPRange?: string;
  }>;
  internal: boolean;
  attachableContainers: Array<{
    id: string;
    name: string;
    ipv4Address: string;
    ipv6Address: string;
    macAddress: string;
    ports: {
      [key: string]: PortMapping[] | null;
    };
    state: {
      Running: boolean;
      Status: string;
    };
  }>;
  options: Record<string, string>;
  labels: Record<string, string>;
  enableIPv6: boolean;
}

interface DisconnectedContainer {
  id: string;
  name: string;
  state: {
    Running: boolean;
    Status: string;
  };
}

export default function NetworkClientComponent() {
  const params = useParams<{ id: string }>();
  const networkId = params?.id;
  const [network, setNetwork] = useState<NetworkDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [disconnectedContainers, setDisconnectedContainers] = useState<
    DisconnectedContainer[]
  >([]);
  const [runLoading, setRunLoading] = useState<string | null>(null);
  const [selectedContainer, setSelectedContainer] = useState<string | null>(
    null
  );
  const [selectedContainerRunning, setSelectedContainerRunning] =
    useState<boolean>(false);

  const fetchNetworkDetail = async () => {
    try {
      const response = await fetch(`${API_URL}/api/networks/${networkId}/`);
      if (!response.ok) throw new Error("Failed to fetch network details");
      const data = await response.json();
      setNetwork(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch network details"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchDisconnectedContainers = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/networks/${networkId}/disconnected/`
      );
      if (!response.ok)
        throw new Error("Failed to fetch disconnected containers");
      const data = await response.json();
      setDisconnectedContainers(data);
    } catch (err) {
      console.error("Failed to fetch disconnected containers:", err);
    }
  };

  useEffect(() => {
    fetchNetworkDetail();
    fetchDisconnectedContainers();
  }, [networkId]);

  const handleContainerAction = async (
    containerId: string,
    action: "start" | "stop"
  ) => {
    try {
      setActionLoading(containerId);
      const response = await fetch(
        `${API_URL}/api/containers/${containerId}/${action}/`,
        {
          method: "POST",
        }
      );
      if (!response.ok) throw new Error(`Failed to ${action} container`);

      // Refresh both connected and disconnected containers
      await Promise.all([fetchNetworkDetail(), fetchDisconnectedContainers()]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `Failed to ${action} container`
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleRunContainer = async (containerId: string) => {
    try {
      setRunLoading(containerId);
      const response = await fetch(
        `${API_URL}/api/containers/${containerId}/start/`,
        {
          method: "POST",
        }
      );
      if (!response.ok) throw new Error("Failed to start container");

      // Refresh both lists
      await Promise.all([fetchNetworkDetail(), fetchDisconnectedContainers()]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start container"
      );
    } finally {
      setRunLoading(null);
    }
  };
  return (
    <>
      <div className="bg-white">
        <div className="px-6 py-4 border-b">
          <h2 className="text-2xl font-semibold">Network Details</h2>
        </div>

        {loading && (
          <div className="text-center py-4">Loading network details...</div>
        )}

        {error && <div className="text-red-500 px-6 py-4">{error}</div>}

        {!loading && !error && network && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p>
                    <span className="font-medium">Name:</span> {network.name}
                  </p>
                  <p>
                    <span className="font-medium">ID:</span> {network.id}
                  </p>
                  <p>
                    <span className="font-medium">Driver:</span>{" "}
                    {network.driver}
                  </p>
                  <p>
                    <span className="font-medium">Scope:</span> {network.scope}
                  </p>
                  <p>
                    <span className="font-medium">Created:</span>{" "}
                    {new Date(network.created).toLocaleString()}
                  </p>
                  <p>
                    <span className="font-medium">Internal:</span>{" "}
                    {network.internal ? "Yes" : "No"}
                  </p>
                  <p>
                    <span className="font-medium">IPv6 Enabled:</span>{" "}
                    {network.enableIPv6 ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">IPAM Configuration</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {network.ipam.map((config, index) => (
                    <div
                      key={index}
                      className="space-y-2 pb-4 last:pb-0 border-b last:border-0"
                    >
                      <p>
                        <span className="font-medium">Subnet:</span>{" "}
                        {config.Subnet}
                      </p>
                      <p>
                        <span className="font-medium">Gateway:</span>{" "}
                        {config.Gateway}
                      </p>
                      {config.IPRange && (
                        <p>
                          <span className="font-medium">IP Range:</span>{" "}
                          {config.IPRange}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Connected Containers</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {network.attachableContainers.length > 0 ? (
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="text-left font-medium pb-2">Name</th>
                        <th className="text-left font-medium pb-2">
                          IPv4 Address
                        </th>
                        <th className="text-left font-medium pb-2">
                          IPv6 Address
                        </th>
                        <th className="text-left font-medium pb-2">Ports</th>
                        <th className="text-left font-medium pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {network.attachableContainers.map((container) => (
                        <tr key={container.id}>
                          <td className="py-2">
                            <Link
                              href={`/containers/${container.id}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {container.name}
                            </Link>
                          </td>
                          <td className="py-2">{container.ipv4Address}</td>
                          <td className="py-2">
                            {container.ipv6Address || "-"}
                          </td>
                          <td className="py-2">
                            <div className="space-y-1">
                              {Object.entries(container.ports || {}).map(
                                ([port, mappings]) => (
                                  <div key={port} className="text-sm">
                                    {port}
                                    {mappings && mappings.length > 0 && (
                                      <span className="text-gray-500">
                                        {" → "}
                                        {mappings.map((mapping, idx) => (
                                          <span key={idx}>
                                            {mapping.HostIp === "0.0.0.0"
                                              ? "*"
                                              : mapping.HostIp}
                                            :{mapping.HostPort}
                                            {idx < mappings.length - 1
                                              ? ", "
                                              : ""}
                                          </span>
                                        ))}
                                      </span>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          </td>
                          <td className="py-2 space-x-2">
                            {container.state.Running ? (
                              <>
                                <button
                                  onClick={() =>
                                    handleContainerAction(container.id, "stop")
                                  }
                                  disabled={actionLoading === container.id}
                                  className="px-2.5 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                >
                                  {actionLoading === container.id
                                    ? "Stopping..."
                                    : "Stop"}
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedContainer(container.id);
                                    setSelectedContainerRunning(true);
                                  }}
                                  className="px-2.5 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                  Log
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() =>
                                    handleContainerAction(container.id, "start")
                                  }
                                  disabled={actionLoading === container.id}
                                  className="px-2.5 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                >
                                  {actionLoading === container.id
                                    ? "Starting..."
                                    : "Run"}
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedContainer(container.id);
                                    setSelectedContainerRunning(false);
                                  }}
                                  className="px-2.5 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                  Log
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500">
                    No containers are currently connected to this network.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Disconnected Containers</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {disconnectedContainers.length > 0 ? (
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="text-left font-medium pb-2">Name</th>
                        <th className="text-left font-medium pb-2">
                          IPv4 Address
                        </th>
                        <th className="text-left font-medium pb-2">
                          IPv6 Address
                        </th>
                        <th className="text-left font-medium pb-2">Ports</th>
                        <th className="text-left font-medium pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {disconnectedContainers.map((container) => (
                        <tr key={container.id}>
                          <td className="py-2">
                            <Link
                              href={`/containers/${container.id}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {container.name}
                            </Link>
                          </td>
                          <td className="py-2">-</td>
                          <td className="py-2">-</td>
                          <td className="py-2">-</td>
                          <td className="py-2 space-x-2">
                            <button
                              onClick={() =>
                                handleContainerAction(container.id, "start")
                              }
                              disabled={actionLoading === container.id}
                              className="px-2.5 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                            >
                              {actionLoading === container.id
                                ? "Starting..."
                                : "Run"}
                            </button>
                            <button
                              onClick={() => setSelectedContainer(container.id)}
                              className="px-2.5 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Log
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500">
                    No disconnected containers found for this network.
                  </p>
                )}
              </div>
            </div>

            {Object.keys(network.options).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Network Options</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dl className="grid grid-cols-2 gap-4">
                    {Object.entries(network.options).map(([key, value]) => (
                      <div key={key}>
                        <dt className="font-medium">{key}</dt>
                        <dd className="mt-1">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}

            {Object.keys(network.labels).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Labels</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dl className="grid grid-cols-2 gap-4">
                    {Object.entries(network.labels).map(([key, value]) => (
                      <div key={key}>
                        <dt className="font-medium">{key}</dt>
                        <dd className="mt-1">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <LogViewer
        containerId={selectedContainer}
        isOpen={!!selectedContainer}
        onClose={() => {
          setSelectedContainer(null);
          setSelectedContainerRunning(false);
        }}
        isRunning={selectedContainerRunning}
      />
    </>
  );
}
