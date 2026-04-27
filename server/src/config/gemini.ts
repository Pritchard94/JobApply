import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "./env.js";

export const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export const flashModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});
export const proModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
