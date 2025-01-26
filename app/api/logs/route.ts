
import { NextResponse } from "next/server";
import LoginLog from "@/models/LoginLog";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();
    const logs = await LoginLog.find({}).sort({ timestamp: -1 });
    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error al obtener logs:", error);
    return NextResponse.json({ error: "Error al obtener logs" }, { status: 500 });
  }
}