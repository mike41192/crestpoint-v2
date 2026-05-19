import { supabase } from "@/lib/supabase/client"

export async function ensureSubscription() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  if (data) return

  await supabase.from("subscriptions").insert({
    user_id: user.id,
    plan: "free",
    ats_credits: 5,
  })
}