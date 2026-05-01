/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CustomerData } from '../types';

const REGIONS = ['North America', 'Europe', 'Asia-Pacific', 'Latin America'];
const PLANS: Array<CustomerData['plan_type']> = ['Basic', 'Pro', 'Enterprise'];

export function generateSyntheticData(count: number = 100): CustomerData[] {
  return Array.from({ length: count }, () => {
    const tenure = Math.floor(Math.random() * 60) + 1;
    const monthly_usage = Math.random() * 500 + 50;
    const login_count = Math.floor(Math.random() * 30);
    const support_tickets = Math.floor(Math.random() * 10);
    const billing_amount = Math.random() * 200 + 20;
    const last_payment_days = Math.floor(Math.random() * 45);
    const engagement_rate = Math.random();
    const nps_score = Math.floor(Math.random() * 11);
    const is_autopay = Math.random() > 0.3;
    const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
    const plan_type = PLANS[Math.floor(Math.random() * PLANS.length)];

    // Heuristic for "churn" in synthetic data construction
    // High support tickets, low NPS, high last payment days = likely churn
    let score = 0;
    if (support_tickets > 5) score += 30;
    if (nps_score < 4) score += 25;
    if (last_payment_days > 30) score += 20;
    if (engagement_rate < 0.2) score += 15;
    if (tenure < 6) score += 10;
    
    const churn_prob = score / 100;
    const churn = Math.random() < churn_prob;

    // Health score: Inverse of churn probability but with some noise
    const health_score = Math.max(0, Math.min(100, 100 - score + (Math.random() * 10 - 5)));

    return {
      customer_id: `CUST-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      tenure,
      monthly_usage,
      login_count,
      support_tickets,
      billing_amount,
      last_payment_days,
      engagement_rate,
      nps_score,
      is_autopay,
      region,
      plan_type,
      churn,
      health_score: Math.round(health_score)
    };
  });
}
