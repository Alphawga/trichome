"use client";

import { useState } from "react";
import { trpc } from "@/utils/trpc";

type DateRange = "today" | "week" | "month" | "year" | "custom";

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("month");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Calculate date range
  const getDateRange = () => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    let start = new Date();

    switch (dateRange) {
      case "today":
        start.setHours(0, 0, 0, 0);
        break;
      case "week":
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        break;
      case "month":
        start.setMonth(start.getMonth() - 1);
        start.setHours(0, 0, 0, 0);
        break;
      case "year":
        start.setFullYear(start.getFullYear() - 1);
        start.setHours(0, 0, 0, 0);
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          start = new Date(customStartDate);
          end.setTime(new Date(customEndDate).getTime());
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
        }
        break;
    }

    return { start, end };
  };

  const { start, end } = getDateRange();

  const analyticsQuery = trpc.getAnalytics.useQuery(
    {
      startDate: start,
      endDate: end,
    },
    {
      enabled: dateRange !== "custom" || (!!customStartDate && !!customEndDate),
      staleTime: 60000,
    },
  );

  const summaryQuery = trpc.getAnalyticsSummary.useQuery(
    {
      startDate: start,
      endDate: end,
    },
    {
      enabled: dateRange !== "custom" || (!!customStartDate && !!customEndDate),
      staleTime: 60000,
    },
  );

  const analytics = analyticsQuery.data || [];
  const summary = summaryQuery.data;

  // Calculate chart data
  const chartData = analytics.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    revenue: Number(item.revenue),
    orders: item.orders,
    visitors: item.visitors,
    pageViews: item.page_views,
  }));

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1);
  const maxOrders = Math.max(...chartData.map((d) => d.orders), 1);
  const maxVisitors = Math.max(...chartData.map((d) => d.visitors), 1);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600">Track your store performance and metrics</p>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm text-gray-500 mb-2 block">
              Date Range
            </label>
            <div className="flex gap-2 flex-wrap">
              {(["today", "week", "month", "year", "custom"] as DateRange[]).map(
                (range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setDateRange(range)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      dateRange === range
                        ? "bg-[#38761d] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ),
              )}
            </div>
          </div>
          {dateRange === "custom" && (
            <>
              <div>
                <label className="text-sm text-gray-500 mb-2 block">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-2 block">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="w-6 h-6 text-blue-600">👥</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Visitors</p>
              <p className="text-2xl font-bold">
                {summaryQuery.isLoading
                  ? "..."
                  : summary?.totalVisitors.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <div className="w-6 h-6 text-purple-600">📄</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Page Views</p>
              <p className="text-2xl font-bold">
                {summaryQuery.isLoading
                  ? "..."
                  : summary?.totalPageViews.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="w-6 h-6 text-green-600">📦</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold">
                {summaryQuery.isLoading
                  ? "..."
                  : summary?.totalOrders.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <div className="w-6 h-6 text-yellow-600">💰</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold">
                {summaryQuery.isLoading
                  ? "..."
                  : `₦${Number(summary?.totalRevenue || 0).toLocaleString()}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Conversion Rate</h3>
            <span className="text-2xl font-bold text-[#38761d]">
              {summaryQuery.isLoading
                ? "..."
                : `${(Number(summary?.avgConversionRate || 0) * 100).toFixed(2)}%`}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#38761d] h-2 rounded-full"
              style={{
                width: `${Math.min(Number(summary?.avgConversionRate || 0) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Bounce Rate</h3>
            <span className="text-2xl font-bold text-gray-700">
              {summaryQuery.isLoading
                ? "..."
                : `${(Number(summary?.avgBounceRate || 0) * 100).toFixed(2)}%`}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gray-600 h-2 rounded-full"
              style={{
                width: `${Math.min(Number(summary?.avgBounceRate || 0) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold mb-4">Revenue Over Time</h3>
        {analyticsQuery.isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#38761d] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-64 flex items-end gap-2">
            {chartData.map((item, index) => (
              <div
                key={index}
                className="flex-1 flex flex-col items-center group"
              >
                <div
                  className="w-full bg-[#38761d] rounded-t hover:bg-[#1E3024] transition-colors cursor-pointer relative"
                  style={{
                    height: `${(item.revenue / maxRevenue) * 100}%`,
                    minHeight: item.revenue > 0 ? "4px" : "0",
                  }}
                  title={`${item.date}: ₦${item.revenue.toLocaleString()}`}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    ₦{item.revenue.toLocaleString()}
                  </div>
                </div>
                <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left">
                  {item.date}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No data available for selected date range
          </div>
        )}
      </div>

      {/* Orders Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold mb-4">Orders Over Time</h3>
        {analyticsQuery.isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#38761d] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-64 flex items-end gap-2">
            {chartData.map((item, index) => (
              <div
                key={index}
                className="flex-1 flex flex-col items-center group"
              >
                <div
                  className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer relative"
                  style={{
                    height: `${(item.orders / maxOrders) * 100}%`,
                    minHeight: item.orders > 0 ? "4px" : "0",
                  }}
                  title={`${item.date}: ${item.orders} orders`}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {item.orders} orders
                  </div>
                </div>
                <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left">
                  {item.date}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No data available for selected date range
          </div>
        )}
      </div>

      {/* Visitors Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold mb-4">Visitors Over Time</h3>
        {analyticsQuery.isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#38761d] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-64 flex items-end gap-2">
            {chartData.map((item, index) => (
              <div
                key={index}
                className="flex-1 flex flex-col items-center group"
              >
                <div
                  className="w-full bg-purple-500 rounded-t hover:bg-purple-600 transition-colors cursor-pointer relative"
                  style={{
                    height: `${(item.visitors / maxVisitors) * 100}%`,
                    minHeight: item.visitors > 0 ? "4px" : "0",
                  }}
                  title={`${item.date}: ${item.visitors} visitors`}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {item.visitors} visitors
                  </div>
                </div>
                <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left">
                  {item.date}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No data available for selected date range
          </div>
        )}
      </div>

      {/* Data Table */}
      {analytics.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Daily Analytics</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 font-semibold text-sm text-gray-700">
                    Date
                  </th>
                  <th className="p-3 font-semibold text-sm text-gray-700">
                    Visitors
                  </th>
                  <th className="p-3 font-semibold text-sm text-gray-700">
                    Page Views
                  </th>
                  <th className="p-3 font-semibold text-sm text-gray-700">
                    Orders
                  </th>
                  <th className="p-3 font-semibold text-sm text-gray-700">
                    Revenue
                  </th>
                  <th className="p-3 font-semibold text-sm text-gray-700">
                    Conversion Rate
                  </th>
                  <th className="p-3 font-semibold text-sm text-gray-700">
                    Bounce Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {analytics.map((item) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-3">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="p-3">{item.visitors}</td>
                    <td className="p-3">{item.page_views}</td>
                    <td className="p-3">{item.orders}</td>
                    <td className="p-3 font-medium">
                      ₦{Number(item.revenue).toLocaleString()}
                    </td>
                    <td className="p-3">
                      {(Number(item.conversion_rate) * 100).toFixed(2)}%
                    </td>
                    <td className="p-3">
                      {(Number(item.bounce_rate) * 100).toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

