"use client";

import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";

type SettingCategory = "general" | "payment" | "shipping" | "email" | "other";

export default function AdminSettingsPage() {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newSetting, setNewSetting] = useState({
    key: "",
    value: "",
    type: "string",
  });

  const settingsQuery = trpc.getSettings.useQuery(undefined, {
    staleTime: 60000,
  });

  const upsertMutation = trpc.upsertSetting.useMutation({
    onSuccess: () => {
      settingsQuery.refetch();
      setEditingKey(null);
      setEditValue("");
      setNewSetting({ key: "", value: "", type: "string" });
      toast.success("Setting saved successfully");
    },
    onError: (error) => {
      toast.error(`Failed to save setting: ${error.message}`);
    },
  });

  const deleteMutation = trpc.deleteSetting.useMutation({
    onSuccess: () => {
      settingsQuery.refetch();
      toast.success("Setting deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete setting: ${error.message}`);
    },
  });

  const settings = settingsQuery.data || [];

  // Group settings by category
  const groupedSettings: Record<SettingCategory, typeof settings> = {
    general: [],
    payment: [],
    shipping: [],
    email: [],
    other: [],
  };

  settings.forEach((setting) => {
    const key = setting.key.toLowerCase();
    if (key.startsWith("payment_") || key.startsWith("paystack_") || key.startsWith("monnify_")) {
      groupedSettings.payment.push(setting);
    } else if (key.startsWith("shipping_") || key.startsWith("delivery_")) {
      groupedSettings.shipping.push(setting);
    } else if (key.startsWith("email_") || key.startsWith("smtp_")) {
      groupedSettings.email.push(setting);
    } else if (
      key.startsWith("site_") ||
      key.startsWith("store_") ||
      key.startsWith("app_")
    ) {
      groupedSettings.general.push(setting);
    } else {
      groupedSettings.other.push(setting);
    }
  });

  const handleEdit = (setting: { key: string; value: string; type: string }) => {
    setEditingKey(setting.key);
    setEditValue(setting.value);
  };

  const handleSave = () => {
    if (!editingKey) return;

    upsertMutation.mutate({
      key: editingKey,
      value: editValue,
      type: settings.find((s) => s.key === editingKey)?.type || "string",
    });
  };

  const handleDelete = (key: string) => {
    if (!confirm(`Are you sure you want to delete the setting "${key}"?`)) {
      return;
    }

    deleteMutation.mutate({ key });
  };

  const handleCreate = () => {
    if (!newSetting.key.trim()) {
      toast.error("Setting key is required");
      return;
    }

    upsertMutation.mutate({
      key: newSetting.key.trim(),
      value: newSetting.value,
      type: newSetting.type,
    });
  };

  const renderSetting = (setting: { key: string; value: string; type: string }) => {
    const isEditing = editingKey === setting.key;

    return (
      <div
        key={setting.key}
        className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
      >
        <div className="flex-1">
          <p className="font-medium text-gray-900">{setting.key}</p>
          <p className="text-xs text-gray-500 mt-1">Type: {setting.type}</p>
        </div>
        <div className="flex-1">
          {isEditing ? (
            <input
              type={setting.type === "number" ? "number" : "text"}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                } else if (e.key === "Escape") {
                  setEditingKey(null);
                  setEditValue("");
                }
              }}
              autoFocus
            />
          ) : (
            <p className="text-gray-700 break-all">
              {setting.value || <span className="text-gray-400">(empty)</span>}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={upsertMutation.isPending}
                className="px-3 py-1.5 bg-[#38761d] text-white rounded-lg hover:bg-[#1E3024] text-sm font-medium transition-colors disabled:opacity-50"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingKey(null);
                  setEditValue("");
                }}
                className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleEdit(setting)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(setting.key)}
                disabled={deleteMutation.isPending}
                className="px-3 py-1.5 border border-red-300 text-red-600 rounded-lg bg-white hover:bg-red-50 text-sm font-medium transition-colors disabled:opacity-50"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600">
          Manage system configuration and preferences
        </p>
      </div>

      {/* Create New Setting */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
        <h2 className="text-lg font-semibold mb-4">Create New Setting</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key
            </label>
            <input
              type="text"
              value={newSetting.key}
              onChange={(e) =>
                setNewSetting({ ...newSetting, key: e.target.value })
              }
              placeholder="e.g., site_name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Value
            </label>
            <input
              type="text"
              value={newSetting.value}
              onChange={(e) =>
                setNewSetting({ ...newSetting, value: e.target.value })
              }
              placeholder="Setting value"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={newSetting.type}
              onChange={(e) =>
                setNewSetting({ ...newSetting, type: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
            >
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleCreate}
              disabled={upsertMutation.isPending}
              className="w-full px-4 py-2 bg-[#38761d] text-white rounded-lg hover:bg-[#1E3024] font-medium transition-colors disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </div>
      </div>

      {/* Settings by Category */}
      {settingsQuery.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#38761d] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : settings.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-500">No settings found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSettings).map(
            ([category, categorySettings]) =>
              categorySettings.length > 0 && (
                <div key={category} className="bg-white p-6 rounded-lg border border-gray-200">
                  <h2 className="text-lg font-semibold mb-4 capitalize">
                    {category} Settings
                  </h2>
                  <div className="space-y-3">
                    {categorySettings.map(renderSetting)}
                  </div>
                </div>
              ),
          )}
        </div>
      )}
    </div>
  );
}

