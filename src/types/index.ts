/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CustomerData {
  customer_id: string;
  tenure: number; // months
  monthly_usage: number; // GB or similar
  login_count: number;
  support_tickets: number;
  billing_amount: number;
  last_payment_days: number;
  engagement_rate: number; // 0-1
  nps_score: number; // 0-10
  is_autopay: boolean;
  region: string;
  plan_type: 'Basic' | 'Pro' | 'Enterprise';
  churn: boolean;
  health_score: number; // 0-100
}

export interface PredictionResult {
  risk_level: 'High' | 'Medium' | 'Low';
  churn_probability: number;
  health_score: number;
  feature_importance: Record<string, number>;
}

export interface Recommendation {
  action: string;
  priority: 'Critical' | 'High' | 'Medium';
  reason: string;
}
