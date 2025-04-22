import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // This is the URL to which the customer will be redirected when they are done
    // managing their billing with the portal.
    const returnUrl = process.env.HOST_URL;
    const { customerId } = await req.json();

    try {
        // Create a session for the customer portal
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
        });

        // Return only the URL from the portalSession object
        return NextResponse.json({ url: portalSession.url });
    } catch (error) {
        console.error("Error creating portal session:", error);
        return NextResponse.json({ error: "Failed to create customer portal session" }, { status: 500 });
    }
}