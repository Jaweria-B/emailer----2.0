import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-12-15.clover", //
});

/**
 * Verify webhook signature for security
 * @param {string} body - Raw request body
 * @param {string} signature - Stripe-Signature header
 * @returns {Object} Verified Stripe event
 */
export function verifyWebhookSignature(body, signature) {
  try {
    return stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }
}
