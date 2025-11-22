import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

interface EmailSubscription {
  email: string;
  timestamp: string;
  id: string;
}

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), "data");
    const filePath = path.join(dataDir, "newsletter-subscriptions.json");

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "No subscriptions found" },
        { status: 404 },
      );
    }

    const fileContent = fs.readFileSync(filePath, "utf8");
    const subscriptions: EmailSubscription[] = JSON.parse(fileContent);

    const csvHeader = "Email,Subscription Date,Time,ID\n";
    const csvRows = subscriptions
      .map((sub) => {
        const date = new Date(sub.timestamp);
        const dateStr = date.toLocaleDateString();
        const timeStr = date.toLocaleTimeString();
        return `"${sub.email}","${dateStr}","${timeStr}","${sub.id}"`;
      })
      .join("\n");

    const csvContent = csvHeader + csvRows;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=trichomes-newsletter-subscriptions-${new Date().toISOString().split("T")[0]}.csv`,
      },
    });
  } catch (error) {
    console.error("Error exporting subscriptions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
