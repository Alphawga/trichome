"use client";

import Link from "next/link";
import  React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { ChevronRightIcon } from "@/components/ui/icons";
import { trpc } from "@/utils/trpc";
import { useAuth } from "../../contexts/auth-context";

const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

const consultationTypes = [
  { value: "skincare", label: "Skincare Consultation", duration: "30 min" },
  { value: "makeup", label: "Makeup Consultation", duration: "30 min" },
  { value: "full", label: "Full Beauty Consultation", duration: "60 min" },
];

const skinConcerns = [
  "Acne",
  "Dry Skin",
  "Oily Skin",
  "Combination Skin",
  "Sensitive Skin",
  "Anti-Aging",
  "Dark Spots",
  "Dullness",
  "Large Pores",
  "Redness",
  "Fine Lines",
  "Other",
];

export default function ConsultationPage() {
  const { session } = useAuth();

  const [formData, setFormData] = useState({
    firstName: session?.user.first_name || "",
    lastName: session?.user.last_name || "",
    email: session?.user.email || "",
    phone: "",
    consultationType: "",
    preferredDate: "",
    preferredTime: "",
    skinConcerns: [] as string[],
    additionalNotes: "",
  });

  const createConsultationMutation = trpc.createConsultation.useMutation({
    onSuccess: (data) => {
      toast.success(
        data.message ||
          "Consultation booked successfully! We will send you a confirmation email.",
      );

      // Reset form
      setFormData({
        firstName: session?.user.first_name || "",
        lastName: session?.user.last_name || "",
        email: session?.user.email || "",
        phone: "",
        consultationType: "",
        preferredDate: "",
        preferredTime: "",
        skinConcerns: [],
        additionalNotes: "",
      });
    },
    onError: (error) => {
      toast.error(
        error.message || "Failed to book consultation. Please try again.",
      );
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleConcernToggle = (concern: string) => {
    setFormData((prev) => ({
      ...prev,
      skinConcerns: prev.skinConcerns.includes(concern)
        ? prev.skinConcerns.filter((c) => c !== concern)
        : [...prev.skinConcerns, concern],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (
      !formData.consultationType ||
      !formData.preferredDate ||
      !formData.preferredTime
    ) {
      toast.error("Please select consultation type, date, and time");
      return;
    }

    // Map UI consultation type to API enum
    const consultationTypeMap: Record<
      string,
      "SKIN_ANALYSIS" | "PRODUCT_RECOMMENDATION" | "ROUTINE_BUILDING" | "GENERAL"
    > = {
      skincare: "SKIN_ANALYSIS",
      makeup: "PRODUCT_RECOMMENDATION",
      full: "ROUTINE_BUILDING",
    };

    createConsultationMutation.mutate({
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      type: consultationTypeMap[formData.consultationType] || "GENERAL",
      preferred_date: formData.preferredDate,
      preferred_time: formData.preferredTime,
      skin_concerns: formData.skinConcerns,
      additional_notes: formData.additionalNotes || undefined,
    });
  };

  // Get minimum date (today)
  const minDate = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header Section */}
      <div className="relative w-full h-[300px] sm:h-[350px] lg:h-[400px] animate-[sectionEntrance_600ms_ease-out]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: "url('/book-a-session.jpg')" }}
          />
          {/* Gradient Overlay - Soft pink/rose tone */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, rgba(166, 147, 142, 0.85), rgba(166, 147, 142, 0.65), rgba(166, 147, 142, 0.3))'
            }}
          ></div>
        </div>

        {/* Content */}
        <div className="relative h-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[2200px] flex flex-col justify-center">
          <div className="flex flex-col items-start max-w-2xl">
            {/* Main Title */}
            <h1 className="text-[40px] sm:text-[48px] lg:text-[56px] font-heading text-white leading-tight mb-4 animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)]">
              Book a Consultation
            </h1>

            {/* Breadcrumbs */}
            <nav 
              className="flex items-center space-x-2 animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)]"
              style={{ animationDelay: "100ms", animationFillMode: "both" }}
            >
              <Link
                href="/"
                className="text-[14px] text-white/80 hover:text-white transition-colors duration-150 ease-out font-body"
              >
                Home
              </Link>
              <ChevronRightIcon className="w-4 h-4 text-white/60" />
              <span className="text-[14px] text-white font-body">
                Book a Consultation
              </span>
            </nav>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-16 sm:pb-20 max-w-[1440px] animate-[sectionEntrance_600ms_ease-out]">

        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-[28px] sm:text-[36px] lg:text-[40px] font-heading mb-3 sm:mb-4 text-gray-900">
              Your Free Consultation
            </h2>
            <p className="text-[15px] sm:text-[16px] lg:text-[17px] text-gray-600 max-w-2xl mx-auto leading-relaxed font-body px-4">
              Get personalized skincare and beauty advice from our expert
              consultants. We'll help you find the perfect products for your
              unique needs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 sm:mb-12">
            {/* Benefits */}
            <div className="bg-white rounded-sm border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 ease-out">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-[#40702A]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Checkmark inside badge</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-heading text-[16px] sm:text-[17px] mb-2 text-gray-900 font-medium">
                Expert Guidance
              </h3>
              <p className="text-[14px] sm:text-[15px] text-gray-600 leading-relaxed font-body">
                Our certified skincare consultants have years of experience
                helping clients achieve their beauty goals.
              </p>
            </div>

            <div className="bg-white rounded-sm border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 ease-out">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-[#40702A]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Clock</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-heading text-[16px] sm:text-[17px] mb-2 text-gray-900 font-medium">
                Flexible Scheduling
              </h3>
              <p className="text-[14px] sm:text-[15px] text-gray-600 leading-relaxed font-body">
                Choose a time that works best for you. We offer both in-store
                and virtual consultations.
              </p>
            </div>

            <div className="bg-white rounded-sm border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 ease-out">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-[#40702A]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Success check</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="font-heading text-[16px] sm:text-[17px] mb-2 text-gray-900 font-medium">
                Personalized Plan
              </h3>
              <p className="text-[14px] sm:text-[15px] text-gray-600 leading-relaxed font-body">
                Receive a customized skincare routine and product
                recommendations tailored to your skin type.
              </p>
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-white rounded-sm border border-gray-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-[20px] sm:text-[24px] font-heading mb-4 sm:mb-6 text-gray-900">
              Fill in Your Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="font-heading text-[15px] sm:text-[16px] mb-3 sm:mb-4 text-gray-900 font-medium">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-[13px] sm:text-[14px] font-medium mb-2 text-gray-900 font-body"
                    >
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-sm border border-gray-200 focus:ring-1 focus:ring-black/10 focus:border-black outline-none bg-white text-gray-900 font-body text-[13px] transition-all duration-150"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-[13px] sm:text-[14px] font-medium mb-2 text-gray-900 font-body"
                    >
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-sm border border-gray-200 focus:ring-1 focus:ring-black/10 focus:border-black outline-none bg-white text-gray-900 font-body text-[13px] transition-all duration-150"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-[13px] sm:text-[14px] font-medium mb-2 text-gray-900 font-body"
                    >
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-sm border border-gray-200 focus:ring-1 focus:ring-black/10 focus:border-black outline-none bg-white text-gray-900 font-body text-[13px] transition-all duration-150"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-[13px] sm:text-[14px] font-medium mb-2 text-gray-900 font-body"
                    >
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-sm border border-gray-200 focus:ring-1 focus:ring-black/10 focus:border-black outline-none bg-white text-gray-900 font-body text-[13px] transition-all duration-150"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Consultation Type */}
              <div>
                <h3 className="font-heading text-[15px] sm:text-[16px] mb-3 sm:mb-4 text-gray-900 font-medium">
                  Consultation Type <span className="text-red-500">*</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {consultationTypes.map((type) => (
                    <label
                      key={type.value}
                      className={`border-2 rounded-sm p-4 cursor-pointer transition-all duration-150 ${
                        formData.consultationType === type.value
                          ? "border-black bg-gray-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="consultationType"
                        value={type.value}
                        checked={formData.consultationType === type.value}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className="font-heading text-[14px] sm:text-[15px] text-gray-900 font-medium">
                        {type.label}
                      </div>
                      <div className="text-[13px] sm:text-[14px] text-gray-600 mt-1 font-body">
                        {type.duration}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Scheduling */}
              <div>
                <h3 className="font-heading text-[15px] sm:text-[16px] mb-3 sm:mb-4 text-gray-900 font-medium">
                  Preferred Date & Time <span className="text-red-500">*</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="preferredDate"
                      className="block text-[13px] sm:text-[14px] font-medium mb-2 text-gray-900 font-body"
                    >
                      Date
                    </label>
                    <input
                      type="date"
                      id="preferredDate"
                      name="preferredDate"
                      min={minDate}
                      value={formData.preferredDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-sm border border-gray-200 focus:ring-1 focus:ring-black/10 focus:border-black outline-none bg-white text-gray-900 font-body text-[13px] transition-all duration-150"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="preferredTime"
                      className="block text-[13px] sm:text-[14px] font-medium mb-2 text-gray-900 font-body"
                    >
                      Time
                    </label>
                    <select
                      id="preferredTime"
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-sm border border-gray-200 focus:ring-1 focus:ring-black/10 focus:border-black outline-none bg-white text-gray-900 font-body text-[13px] transition-all duration-150"
                      required
                    >
                      <option value="">Select a time</option>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Skin Concerns */}
              <div>
                <h3 className="font-heading text-[15px] sm:text-[16px] mb-3 sm:mb-4 text-gray-900 font-medium">
                  Skin Concerns (Select all that apply)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {skinConcerns.map((concern) => (
                    <label
                      key={concern}
                      className="flex items-center space-x-2 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={formData.skinConcerns.includes(concern)}
                        onChange={() => handleConcernToggle(concern)}
                        className="w-4 h-4 rounded-sm border-gray-300 text-black focus:ring-black/10 focus:ring-1 transition-all duration-150"
                      />
                      <span className="text-[13px] sm:text-[14px] text-gray-900 font-body group-hover:text-black transition-colors duration-150">
                        {concern}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label
                  htmlFor="additionalNotes"
                  className="block text-[13px] sm:text-[14px] font-medium mb-2 text-gray-900 font-body"
                >
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Tell us more about your skincare goals, current routine, or any specific concerns..."
                  className="w-full px-4 py-2.5 rounded-sm border border-gray-200 focus:ring-1 focus:ring-black/10 focus:border-black outline-none resize-none bg-white text-gray-900 font-body text-[13px] transition-all duration-150 placeholder:text-gray-400"
                />
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 gap-4">
                <p className="text-[13px] sm:text-[14px] text-gray-600 font-body">
                  <span className="text-red-500">*</span> Required fields
                </p>
                <button
                  type="submit"
                  disabled={createConsultationMutation.isPending}
                  className="bg-[#1E3024] text-white px-6 sm:px-8 py-3 rounded-full hover:bg-[#1E3024]/90 font-medium transition-all duration-150 ease-out hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-[14px] sm:text-[15px] font-body"
                >
                  {createConsultationMutation.isPending
                    ? "Booking..."
                    : "Book Consultation"}
                </button>
              </div>
            </form>
          </div>

          {/* Contact Info */}
          <div className="mt-6 sm:mt-8 bg-gray-50 rounded-sm border border-gray-200 p-6 sm:p-8 text-center">
            <h3 className="font-heading text-[18px] sm:text-[20px] mb-2 text-gray-900 font-medium">
              Need Help?
            </h3>
            <p className="text-[14px] sm:text-[15px] text-gray-600 mb-4 font-body">
              Have questions about our consultation service? Our team is here to
              help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:consultations@trichome.com"
                className="text-[#40702A] hover:text-gray-900 font-medium text-[14px] sm:text-[15px] font-body transition-colors duration-150"
              >
                consultations@trichome.com
              </a>
              <a
                href="tel:+2341234567890"
                className="text-[#40702A] hover:text-gray-900 font-medium text-[14px] sm:text-[15px] font-body transition-colors duration-150"
              >
                +234 123 456 7890
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
