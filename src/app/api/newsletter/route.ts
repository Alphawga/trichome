import fs from "node:fs";
import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";

interface EmailSubscription {
  email: string;
  timestamp: string;
  id: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 },
      );
    }

    const dataDir = path.join(process.cwd(), "data");
    const filePath = path.join(dataDir, "newsletter-subscriptions.json");

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    let subscriptions: EmailSubscription[] = [];

    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf8");
      subscriptions = JSON.parse(fileContent);
    }

    const existingSubscription = subscriptions.find(
      (sub) => sub.email.toLowerCase() === email.toLowerCase(),
    );

    if (existingSubscription) {
      return NextResponse.json(
        { message: "Email already subscribed", alreadyExists: true },
        { status: 200 },
      );
    }

    const newSubscription: EmailSubscription = {
      email: email.toLowerCase().trim(),
      timestamp: new Date().toISOString(),
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };

    subscriptions.push(newSubscription);

    fs.writeFileSync(filePath, JSON.stringify(subscriptions, null, 2));

    return NextResponse.json(
      {
        message: "Successfully subscribed to newsletter",
        subscription: newSubscription,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), "data");
    const filePath = path.join(dataDir, "newsletter-subscriptions.json");

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ subscriptions: [], count: 0 });
    }

    const fileContent = fs.readFileSync(filePath, "utf8");
    const subscriptions: EmailSubscription[] = JSON.parse(fileContent);

    return NextResponse.json({
      subscriptions,
      count: subscriptions.length,
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
