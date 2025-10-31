// payment service --- stripe wrapper
// basically where you integrate your payment gateway (Stripe, Paystack, Flutterwave
// src/services/payment.service.ts
import Stripe from "stripe";
import { ENV } from "../config/env";

const stripe = new Stripe(ENV.STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });

export async function chargeCard(opts: {
  amountCents: number;
  paymentMethodId: string;
  currency?: string;
  description?: string;
  metadata?: Record<string, string>;
  idempotencyKey?: string;
}) {
  const { amountCents, paymentMethodId, currency = "usd", description, metadata, idempotencyKey } = opts;

  const pi = await stripe.paymentIntents.create(
    {
      amount: amountCents,
      currency,
      payment_method: paymentMethodId,
      confirm: true,
      confirmation_method: "automatic",
      description,
      metadata,
    },
    idempotencyKey ? { idempotencyKey } : undefined
  );

  return pi; // contains id and status
}

export async function verifyPaymentIntent(paymentIntentId: string) {
  try {
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    return pi;
  } catch (err) {
    console.error("Error verifying payment intent:", err);
    return null;
  }
}




































// import Stripe from "stripe";
// import { ENV } from "../config/env";


// const stripe = new Stripe(ENV.STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });

// export async function chargeCard({
//   amountCents,
//   currency = "usd",
//   paymentMethodId,
//   description,
//   metadata,
// }: {
//   amountCents: number;
//   currency?: string;
//   paymentMethodId: string;
//   description?: string;
//   metadata?: Record<string, string>;
// }) {
//   // We create a PaymentIntent and attempt to confirm it using the provided payment method id.
//   const paymentIntent = await stripe.paymentIntents.create({
//     amount: amountCents,
//     currency,
//     payment_method: paymentMethodId,
//     confirm: true,
//     description,
//     metadata,
//   });

//   // paymentIntent.status: 'succeeded' | 'requires_action' | ...
//   return paymentIntent;
// }
