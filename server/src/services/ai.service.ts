import { flashModel, proModel } from "../config/gemini.js";
import { logger } from "../utils/logger.js";

export interface ParsedCV {
  personalInfo: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    links?: string[];
  };
  skills: {
    technical: string[];
    soft: string[];
  };
  experience: Array<{
    company: string;
    role: string;
    location?: string;
    startDate: string;
    endDate?: string;
    description: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field?: string;
    startDate?: string;
    endDate?: string;
  }>;
  summary?: string;
}

export interface MatchResult {
  score: number;
  reasoning: string;
  suggestedTailoring?: string;
}

export class AIService {
  /**
   * Parses CV text or buffer into structured data
   */
  async parseCV(cvText: string): Promise<ParsedCV> {
    try {
      const prompt = `
        You are an expert ATS (Applicant Tracking System) parser. 
        Extract the following information from the CV text below into a clean JSON format.
        CV Text:
        ${cvText}

        The JSON should follow this structure exactly:
        {
          "personalInfo": { "fullName": "", "email": "", "phone": "", "location": "", "links": [] },
          "skills": { "technical": [], "soft": [] },
          "experience": [{ "company": "", "role": "", "location": "", "startDate": "", "endDate": "", "description": [] }],
          "education": [{ "institution": "", "degree": "", "field": "", "startDate": "", "endDate": "" }],
          "summary": ""
        }
        Return ONLY the JSON.
      `;

      const result = await flashModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Basic JSON extraction from markdown if necessary
      const jsonStr = text.replace(/```json|```/g, "").trim();
      return JSON.parse(jsonStr) as ParsedCV;
    } catch (error) {
      logger.error({ err: error }, "Error parsing CV with Gemini:");
      throw new Error("Failed to parse CV");
    }
  }

  /**
   * Matches a CV against a job description
   */
  async matchJob(cvData: ParsedCV, jobDescription: string): Promise<MatchResult> {
    try {
      const prompt = `
        You are a hiring manager. Compare the candidate's CV data with the job description below.
        
        Candidate CV:
        ${JSON.stringify(cvData)}

        Job Description:
        ${jobDescription}

        Rate the match on a scale of 0 to 100.
        Provide a concise reasoning for the score (max 3 sentences).
        Also provide a "suggestedTailoring" string which is a short recommendation for the candidate to improve their application (e.g. "Highlight your React experience more").

        Return ONLY a JSON object:
        {
          "score": number,
          "reasoning": "string",
          "suggestedTailoring": "string"
        }
      `;

      const result = await flashModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonStr = text.replace(/```json|```/g, "").trim();
      return JSON.parse(jsonStr) as MatchResult;
    } catch (error) {
      logger.error({ err: error }, "Error matching job with Gemini:");
      return { score: 0, reasoning: "Error during match analysis" };
    }
  }

  /**
   * Generates a tailored cover letter or bullet points for a job
   */
  async tailorApplication(cvData: ParsedCV, jobDescription: string): Promise<{ coverLetter: string }> {
    try {
      const prompt = `
        You are a career coach. Write a professional, concise cover letter (max 250 words) 
        for the candidate based on their CV and the job description.
        Focus on how their specific experiences solve the company's needs.

        Candidate CV:
        ${JSON.stringify(cvData)}

        Job Description:
        ${jobDescription}

        Return ONLY the cover letter text.
      `;

      const result = await proModel.generateContent(prompt);
      const response = await result.response;
      return { coverLetter: response.text().trim() };
    } catch (error) {
      logger.error({ err: error }, "Error tailoring application with Gemini:");
      throw new Error("Failed to tailor application");
    }
  }
}

export const aiService = new AIService();
