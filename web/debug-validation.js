#!/usr/bin/env node

/**
 * Validation Error Debugger - Shows detailed validation errors
 * 
 * Usage:
 *   node debug-validation.js lead-score
 *   node debug-validation.js followup-suggestions
 */

import {
  validateLeadScoreInput,
  validateFollowupSuggestionsInput,
  validateSentimentAnalysisInput,
  validateGenerateProposalInput,
  validateRevenueForecastInput,
  validatePricingAdviceInput,
  validateStaffRosterInput,
  validateLeadRiskAlertsInput,
  validateMenuRecommendationInput,
  validateConsumptionPredictionInput,
  validateLowStockForecastInput,
  validateCrossBranchAnalysisInput,
  validateGlobalRevenueForecastInput,
  validateMarketingROIInput,
  validateChatbotInput,
  validateWhatsAppConciergeInput,
  validateVideoInvitationInput,
  validateGenerateImageInput,
} from "./src/lib/ai-validators.js";

const validators = {
  "lead-score": validateLeadScoreInput,
  "followup-suggestions": validateFollowupSuggestionsInput,
  "sentiment-analysis": validateSentimentAnalysisInput,
  "generate-proposal": validateGenerateProposalInput,
  "revenue-forecast": validateRevenueForecastInput,
  "pricing-advice": validatePricingAdviceInput,
  "staff-roster": validateStaffRosterInput,
  "lead-risk-alerts": validateLeadRiskAlertsInput,
  "menu-recommendation": validateMenuRecommendationInput,
  "consumption-prediction": validateConsumptionPredictionInput,
  "low-stock-forecast": validateLowStockForecastInput,
  "cross-branch-analysis": validateCrossBranchAnalysisInput,
  "global-revenue-forecast": validateGlobalRevenueForecastInput,
  "marketing-roi": validateMarketingROIInput,
  chatbot: validateChatbotInput,
  "whatsapp-concierge": validateWhatsAppConciergeInput,
  "video-invitation": validateVideoInvitationInput,
  "generate-image": validateGenerateImageInput,
};

// Sample payloads (old format that fails validation)
const payloads = {
  "lead-score": {
    lead_id: "lead_12345",
    event_type: "Wedding",
    budget_min: 500000,
    budget_max: 800000,
    budget_flexibility: "Flexible",
    preferred_date: "2026-05-15",
    expected_guests: 350,
    source: "Google Ads",
    status: "Qualified",
    followup_count: 3,
    last_followup_date: "2026-02-25",
    response_rate: 0.75,
    created_at: "2026-02-20",
    branch_id: "branch_001",
    franchise_id: "franchise_001",
  },
};

const endpoint = process.argv[2];

if (!endpoint || !validators[endpoint]) {
  log(`\nUsage: node debug-validation.js <endpoint>\n`, "yellow");
  log(`Available endpoints:`, "blue");
  Object.keys(validators).forEach((name) => log(`  - ${name}`, "gray"));
  process.exit(0);
}

function log(msg, color = "reset") {
  const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    gray: "\x1b[90m",
  };
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

log(`\n🔍 Validating: ${endpoint}`, "blue");
log(`═`.repeat(70), "blue");

const payload = payloads[endpoint] || {};

log(`Payload:`, "yellow");
log(JSON.stringify(payload, null, 2), "gray");
log("");

const validator = validators[endpoint];
const result = validator(payload);

if (result.valid) {
  log(`✅ VALID!`, "green");
  log(`Data:`, "yellow");
  log(JSON.stringify(result.data, null, 2), "gray");
} else {
  log(`❌ VALIDATION ERRORS:`, "red");
  result.errors.forEach((err, i) => {
    log(`  ${i + 1}. ${err}`, "red");
  });
}

log("", "reset");
