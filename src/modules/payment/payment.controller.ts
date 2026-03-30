/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { envVars } from "../../config/env";
import { stripe } from "../../config/stripe.config";
import { PaymentService } from "./payment.service";

const handleStripeWebhookEvent = async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;
  const webhookSecret = envVars.STRIPE.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    console.error("Missing Stripe signature or webhook secret");
    return res
      .status(400)
      .json({ message: "Missing Stripe signature or webhook secret" });
  }

  let event;

  try {
    // 🔥 IMPORTANT: req.body must be RAW (Buffer)
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      webhookSecret
    );
  } catch (error: any) {
    console.error("Stripe signature verification failed:", error.message);
    return res.status(400).json({
      message: "Webhook signature verification failed",
    });
  }

  try {
    const result = await PaymentService.handlerStripeWebhookEvent(event);

    // 🔥 Stripe expects 2xx response fast
    return res.status(200).json({
      success: true,
      message: "Webhook processed",
      data: result,
    });
  } catch (error) {
    console.error("Error handling Stripe webhook:", error);

    return res.status(500).json({
      success: false,
      message: "Webhook handler failed",
    });
  }
};

export const PaymentController = {
    handleStripeWebhookEvent,
}

