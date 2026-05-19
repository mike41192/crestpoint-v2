import Stripe from "stripe"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "confirm-checkout",
  })
}

export async function POST(req: Request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!stripeKey) {
      return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 })
    }

    if (!supabaseUrl) {
      return NextResponse.json({ error: "Missing NEXT_PUBLIC_SUPABASE_URL" }, { status: 500 })
    }

    if (!serviceKey) {
      return NextResponse.json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 })
    }

    const { sessionId } = await req.json()

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 })
    }

    const stripe = new Stripe(stripeKey)

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    const userId = session.metadata?.user_id

    if (!userId) {
      return NextResponse.json(
        { error: "Missing user_id metadata on Stripe session." },
        { status: 400 }
      )
    }

    const adminSupabase = createClient(supabaseUrl, serviceKey)

    const { error } = await adminSupabase
      .from("subscriptions")
      .upsert(
        {
          user_id: userId,
          plan: "pro",
          ats_credits: 999,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )

    if (error) {
      return NextResponse.json({ error: `Supabase error: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      userId,
      plan: "pro",
      credits: 999,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Checkout confirmation failed." },
      { status: 500 }
    )
  }
}