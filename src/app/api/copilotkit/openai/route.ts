import {
  GoogleGenerativeAIAdapter,
  CopilotRuntime,
} from "@copilotkit/backend";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "edge";

export async function POST(req: Request): Promise<Response> {
  const copilotKit = new CopilotRuntime();
  const genAI = new GoogleGenerativeAI(process.env["GOOGLE_API_KEY"]!);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  return copilotKit.response(req, new GoogleGenerativeAIAdapter());
}
