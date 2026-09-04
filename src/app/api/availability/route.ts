import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/booking/slots";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const doctorId = searchParams.get("doctorId");
  const date = searchParams.get("date");

  if (!doctorId || !date) {
    return NextResponse.json({ error: "doctorId and date are required" }, { status: 400 });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date must be in YYYY-MM-DD format" }, { status: 400 });
  }

  try {
    const slots = await getAvailableSlots(doctorId, date);
    return NextResponse.json({ slots });
  } catch (err) {
    console.error("GET /api/availability error:", err);
    return NextResponse.json({ error: "Failed to load availability" }, { status: 500 });
  }
}
