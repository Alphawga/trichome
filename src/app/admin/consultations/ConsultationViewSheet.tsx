"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { trpc } from "@/utils/trpc";

const consultationTypeLabels: Record<string, string> = {
  SKIN_ANALYSIS: "Skincare Consultation",
  PRODUCT_RECOMMENDATION: "Product Recommendation",
  ROUTINE_BUILDING: "Routine Building",
  GENERAL: "General Consultation",
};

const consultationStatusLabels: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No Show",
};

interface ConsultationViewSheetProps {
  consultationId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConsultationViewSheet({
  consultationId,
  open,
  onOpenChange,
}: ConsultationViewSheetProps) {
  const consultationQuery = trpc.getConsultationByIdAdmin.useQuery(
    consultationId ? { id: consultationId } : { id: "" },
    { enabled: !!consultationId && open },
  );

  if (!consultationId) return null;

  const consultation = consultationQuery.data;

  if (consultationQuery.isLoading) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg px-4 md:px-6">
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#38761d] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!consultation) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg px-4 md:px-6">
          <div className="text-center py-8 text-gray-500">
            Consultation not found
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg px-4 md:px-6 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Consultation Details</SheetTitle>
          <SheetDescription>
            View complete consultation information
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">
                  {consultation.first_name} {consultation.last_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{consultation.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{consultation.phone}</p>
              </div>
              {consultation.user && (
                <div>
                  <p className="text-sm text-gray-500">User Account</p>
                  <p className="font-medium">
                    {consultation.user.first_name} {consultation.user.last_name} (
                    {consultation.user.email})
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Consultation Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Consultation Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium">
                  {consultationTypeLabels[consultation.type] || consultation.type}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Preferred Date</p>
                <p className="font-medium">
                  {new Date(consultation.preferred_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Preferred Time</p>
                <p className="font-medium">{consultation.preferred_time}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${consultation.status === "COMPLETED"
                      ? "bg-green-100 text-green-800"
                      : consultation.status === "CONFIRMED"
                        ? "bg-blue-100 text-blue-800"
                        : consultation.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : consultation.status === "CANCELLED"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                >
                  {consultationStatusLabels[consultation.status] ||
                    consultation.status}
                </span>
              </div>
            </div>
          </div>

          {/* Skin Concerns */}
          {consultation.skin_concerns && consultation.skin_concerns.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Skin Concerns</h3>
              <div className="flex flex-wrap gap-2">
                {consultation.skin_concerns.map((concern, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {concern}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Additional Notes */}
          {consultation.additional_notes && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Additional Notes</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                {consultation.additional_notes}
              </p>
            </div>
          )}

          {/* Dates */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Timeline</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">
                  {new Date(consultation.created_at).toLocaleString()}
                </p>
              </div>
              {consultation.confirmed_at && (
                <div>
                  <p className="text-sm text-gray-500">Confirmed At</p>
                  <p className="font-medium">
                    {new Date(consultation.confirmed_at).toLocaleString()}
                  </p>
                </div>
              )}
              {consultation.completed_at && (
                <div>
                  <p className="text-sm text-gray-500">Completed At</p>
                  <p className="font-medium">
                    {new Date(consultation.completed_at).toLocaleString()}
                  </p>
                </div>
              )}
              {consultation.cancelled_at && (
                <div>
                  <p className="text-sm text-gray-500">Cancelled At</p>
                  <p className="font-medium">
                    {new Date(consultation.cancelled_at).toLocaleString()}
                  </p>
                  {consultation.cancellation_reason && (
                    <p className="text-sm text-gray-600 mt-1">
                      Reason: {consultation.cancellation_reason}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

