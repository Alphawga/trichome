"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  EditIcon,
  EyeIcon,
  MailIcon,
  PhoneIcon,
  ShieldIcon,
  UserIcon,
} from "@/components/ui/icons";
import { trpc } from "@/utils/trpc";

interface ProfileFormData {
  first_name: string;
  last_name: string;
  phone: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function AdminProfilePage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "security" | "activity" | "settings"
  >("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Fetch profile data
  const profileQuery = trpc.getProfile.useQuery(undefined, {
    staleTime: 60000,
  });

  const profile = profileQuery.data;

  // Profile update mutation
  const updateProfileMutation = trpc.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");
      profileQuery.refetch();
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  // Password change mutation
  const changePasswordMutation = trpc.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Password changed successfully");
      setShowPasswordForm(false);
      passwordForm.reset();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to change password");
    },
  });

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      profileForm.reset({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
      });
    }
  }, [profile, profileForm]);

  const handleSaveProfile = (data: ProfileFormData) => {
    updateProfileMutation.mutate({
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (profile) {
      profileForm.reset({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
      });
    }
  };

  const handleChangePassword = (data: PasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (data.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (date: Date | string | null | undefined) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (profileQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#38761d] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (profileQuery.error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Failed to load profile</p>
        <button
          type="button"
          onClick={() => profileQuery.refetch()}
          className="px-4 py-2 bg-[#38761d] text-white rounded-lg hover:bg-[#1E3024]"
        >
          Retry
        </button>
      </div>
    );
  }

  const displayName = profile?.name || `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Admin User";

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg border">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <Image
                  src={profile?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=38761d&color=fff`}
                  alt={displayName}
                  fill
                  className="rounded-full object-cover"
                />
              </div>

              <h2 className="text-xl font-bold text-gray-900">
                {displayName}
              </h2>
              <p className="text-gray-600 capitalize">{profile?.role?.toLowerCase() || "Admin"}</p>
              <p className="text-sm text-gray-500 mb-4">
                {profile?.email}
              </p>

              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${profile?.status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                  }`}
              >
                {profile?.status === "ACTIVE" ? "Active" : profile?.status || "Unknown"}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center text-sm">
                <MailIcon className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-gray-600">{profile?.email}</span>
              </div>
              {profile?.phone && (
                <div className="flex items-center text-sm">
                  <PhoneIcon className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">{profile.phone}</span>
                </div>
              )}
              <div className="flex items-center text-sm">
                <UserIcon className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-gray-600">
                  Joined {formatDate(profile?.created_at)}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <EyeIcon className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-gray-600">
                  Last login: {formatDateTime(profile?.last_login_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {(
                [
                  { key: "overview", label: "Overview" },
                  { key: "security", label: "Security" },
                ] as const
              ).map((tab) => (
                <button
                  type="button"
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.key
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg border p-6">
            {activeTab === "overview" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Profile Information</h3>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <EditIcon />
                      Edit Profile
                    </button>
                  )}
                </div>

                <form onSubmit={profileForm.handleSubmit(handleSaveProfile)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="first_name"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        First Name
                      </label>
                      {isEditing ? (
                        <input
                          id="first_name"
                          type="text"
                          {...profileForm.register("first_name")}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
                        />
                      ) : (
                        <p className="text-gray-900">{profile?.first_name || "Not set"}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="last_name"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Last Name
                      </label>
                      {isEditing ? (
                        <input
                          id="last_name"
                          type="text"
                          {...profileForm.register("last_name")}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
                        />
                      ) : (
                        <p className="text-gray-900">{profile?.last_name || "Not set"}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Email
                      </label>
                      <p className="text-gray-900">{profile?.email}</p>
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Phone
                      </label>
                      {isEditing ? (
                        <input
                          id="phone"
                          type="tel"
                          {...profileForm.register("phone")}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
                        />
                      ) : (
                        <p className="text-gray-900">{profile?.phone || "Not set"}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <p className="text-gray-900 capitalize">{profile?.role?.toLowerCase()}</p>
                    <p className="text-xs text-gray-500 mt-1">Role can only be changed by a super admin</p>
                  </div>

                  {isEditing && (
                    <div className="mt-6 flex gap-3">
                      <button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="px-4 py-2 bg-[#38761d] text-white rounded-lg hover:bg-[#1E3024] disabled:opacity-50"
                      >
                        {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {activeTab === "security" && (
              <div>
                <h3 className="text-lg font-semibold mb-6">
                  Security Settings
                </h3>

                <div className="space-y-6">
                  {/* Account Status */}
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Account Status</h4>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${profile?.status === "ACTIVE" ? "bg-green-500" : "bg-yellow-500"}`} />
                      <span className="text-sm">{profile?.status === "ACTIVE" ? "Active" : profile?.status}</span>
                    </div>
                  </div>

                  {/* Email Verification */}
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Email Verification</h4>
                    <div className="flex items-center gap-2">
                      {profile?.email_verified_at ? (
                        <>
                          <ShieldIcon className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-700">
                            Verified on {formatDate(profile.email_verified_at)}
                          </span>
                        </>
                      ) : (
                        <>
                          <ShieldIcon className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm text-yellow-700">Not verified</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Change Password */}
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Change Password</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Keep your account secure with a strong password
                    </p>

                    {!showPasswordForm ? (
                      <button
                        type="button"
                        onClick={() => setShowPasswordForm(true)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        Update Password
                      </button>
                    ) : (
                      <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="space-y-4">
                        <div>
                          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                          </label>
                          <input
                            id="currentPassword"
                            type="password"
                            {...passwordForm.register("currentPassword", { required: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
                          />
                        </div>
                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                          </label>
                          <input
                            id="newPassword"
                            type="password"
                            {...passwordForm.register("newPassword", { required: true, minLength: 8 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
                          />
                          <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                        </div>
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                          </label>
                          <input
                            id="confirmPassword"
                            type="password"
                            {...passwordForm.register("confirmPassword", { required: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={changePasswordMutation.isPending}
                            className="px-4 py-2 bg-[#38761d] text-white rounded-lg hover:bg-[#1E3024] disabled:opacity-50"
                          >
                            {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowPasswordForm(false);
                              passwordForm.reset();
                            }}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
