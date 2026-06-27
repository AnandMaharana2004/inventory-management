import { NextResponse } from "next/server";
import { seedDatabase } from "@/seed";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Seeding is disabled in production" },
      { status: 403 }
    );
  }

  try {
    const summary = await seedDatabase();
    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error("Seeding failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
