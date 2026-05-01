/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { CustomerData, PredictionResult, Recommendation } from '../types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function getRetentionRecommendations(
  customer: CustomerData,
  prediction: PredictionResult
): Promise<Recommendation[]> {
  if (!process.env.GEMINI_API_KEY) {
    return [
      {
        action: 'Standard Outreach',
        priority: 'Medium',
        reason: 'Basic retention workflow triggered (API Key missing).'
      }
    ];
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const prompt = `
      You are a Retention Specialist for a SaaS company. 
      Analyze this customer and provide 3 specific, actionable retention recommendations.
      
      Customer Info:
      - Plan: ${customer.plan_type}
      - Tenure: ${customer.tenure} months
      - Health Score: ${customer.health_score}/100
      - Churn Risk: ${prediction.risk_level} (${prediction.churn_probability * 100}% probability)
      - Key Metrics: ${customer.support_tickets} tickets, NPS ${customer.nps_score}, ${customer.engagement_rate * 100}% engagement.
      
      Return ONLY a JSON array of objects with keys: "action", "priority" (Critical, High, Medium), and "reason".
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanedJson = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error('Gemini error:', error);
    return [
      {
        action: 'Priority Support Call',
        priority: 'High',
        reason: 'Automatic trigger due to elevated risk.'
      }
    ];
  }
}
