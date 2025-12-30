// lib/stripe.js
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

// Initialize Stripe with latest API version
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
  typescript: false,
});

// Fixed exchange rate: 1 USD = 280 PKR
export const EXCHANGE_RATE = 280;

/**
 * Convert PKR to USD for Stripe checkout
 * @param {number} pkrAmount - Amount in PKR
 * @returns {number} Amount in USD cents (Stripe format)
 */
export function convertPKRtoUSDCents(pkrAmount) {
  const usdAmount = pkrAmount / EXCHANGE_RATE; // Convert to USD
  return Math.round(usdAmount * 100); // Convert to cents and round
}

/**
 * Format price for display
 * @param {number} amount - Amount
 * @param {string} currency - Currency code (PKR or USD)
 * @returns {string} Formatted price
 */
export function formatPrice(amount, currency) {
  if (currency === "PKR") {
    return `PKR ${amount.toLocaleString()}`;
  } else if (currency === "USD") {
    return `$${amount.toFixed(2)}`;
  }
  return `${currency} ${amount}`;
}

/**
 * Get Stripe price in cents
 * @param {number} amount - Amount in base currency
 * @param {string} currency - Currency code
 * @returns {number} Amount in cents/smallest unit
 */
export function getStripePriceInCents(amount, currency) {
  if (currency === "PKR") {
    // PKR package prices need to be converted to USD
    return convertPKRtoUSDCents(amount);
  } else {
    // USD prices are already in dollars, just convert to cents
    return Math.round(amount * 100);
  }
}
