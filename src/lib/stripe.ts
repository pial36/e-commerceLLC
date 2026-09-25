import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

/** Null when no key configured — callers fall back to a demo order flow. */
export const stripe = key
  ? new Stripe(key, { apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion })
  : null;

export const isStripeEnabled = Boolean(key);
