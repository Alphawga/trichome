'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRightIcon } from '@/components/ui/icons';
import { toast } from 'sonner';

const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
];

const consultationTypes = [
  { value: 'skincare', label: 'Skincare Consultation', duration: '30 min' },
  { value: 'makeup', label: 'Makeup Consultation', duration: '30 min' },
  { value: 'full', label: 'Full Beauty Consultation', duration: '60 min' },
];

const skinConcerns = [
  'Acne', 'Dry Skin', 'Oily Skin', 'Combination Skin',
  'Sensitive Skin', 'Anti-Aging', 'Dark Spots', 'Dullness',
  'Large Pores', 'Redness', 'Fine Lines', 'Other'
];

export default function ConsultationPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    consultationType: '',
    preferredDate: '',
    preferredTime: '',
    skinConcerns: [] as string[],
    additionalNotes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConcernToggle = (concern: string) => {
    setFormData(prev => ({
      ...prev,
      skinConcerns: prev.skinConcerns.includes(concern)
        ? prev.skinConcerns.filter(c => c !== concern)
        : [...prev.skinConcerns, concern]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.consultationType || !formData.preferredDate || !formData.preferredTime) {
      toast.error('Please select consultation type, date, and time');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement actual booking API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success('Consultation booked successfully! We will send you a confirmation email.');

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        consultationType: '',
        preferredDate: '',
        preferredTime: '',
        skinConcerns: [],
        additionalNotes: '',
      });
    } catch (error) {
      toast.error('Failed to book consultation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (today)
  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <ChevronRightIcon className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Book a Consultation</span>
      </nav>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Book Your Free Consultation</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get personalized skincare and beauty advice from our expert consultants.
            We'll help you find the perfect products for your unique needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Benefits */}
          <div className="bg-white rounded-lg border p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2">Expert Guidance</h3>
            <p className="text-sm text-gray-600">
              Our certified skincare consultants have years of experience helping clients achieve their beauty goals.
            </p>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2">Flexible Scheduling</h3>
            <p className="text-sm text-gray-600">
              Choose a time that works best for you. We offer both in-store and virtual consultations.
            </p>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2">Personalized Plan</h3>
            <p className="text-sm text-gray-600">
              Receive a customized skincare routine and product recommendations tailored to your skin type.
            </p>
          </div>
        </div>

        {/* Booking Form */}
        <div className="bg-white rounded-lg border p-8">
          <h2 className="text-2xl font-bold mb-6">Fill in Your Details</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Consultation Type */}
            <div>
              <h3 className="font-semibold mb-4">Consultation Type <span className="text-red-500">*</span></h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {consultationTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      formData.consultationType === type.value
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
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
                    <div className="font-semibold">{type.label}</div>
                    <div className="text-sm text-gray-600 mt-1">{type.duration}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Scheduling */}
            <div>
              <h3 className="font-semibold mb-4">Preferred Date & Time <span className="text-red-500">*</span></h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="preferredDate" className="block text-sm font-medium mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    id="preferredDate"
                    name="preferredDate"
                    min={minDate}
                    value={formData.preferredDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="preferredTime" className="block text-sm font-medium mb-2">
                    Time
                  </label>
                  <select
                    id="preferredTime"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
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
              <h3 className="font-semibold mb-4">Skin Concerns (Select all that apply)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {skinConcerns.map((concern) => (
                  <label
                    key={concern}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.skinConcerns.includes(concern)}
                      onChange={() => handleConcernToggle(concern)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm">{concern}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label htmlFor="additionalNotes" className="block text-sm font-medium mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                rows={4}
                placeholder="Tell us more about your skincare goals, current routine, or any specific concerns..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-gray-600">
                <span className="text-red-500">*</span> Required fields
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Booking...' : 'Book Consultation'}
              </button>
            </div>
          </form>
        </div>

        {/* Contact Info */}
        <div className="mt-8 bg-green-50 rounded-lg p-6 text-center">
          <h3 className="font-bold text-lg mb-2">Need Help?</h3>
          <p className="text-gray-700 mb-4">
            Have questions about our consultation service? Our team is here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:consultations@trichome.com"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              consultations@trichome.com
            </a>
            <a
              href="tel:+2341234567890"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              +234 123 456 7890
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
