import { createClient } from "@supabase/supabase-js";

let _supabase = null;

function getSupabase() {
  if (_supabase) return _supabase;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  _supabase = createClient(url, key);
  return _supabase;
}

/**
 * Send a 6-digit OTP via Supabase Auth (email template configured in Supabase dashboard).
 */
export async function sendVerificationOtp(email) {
  const supabase = getSupabase();

  if (!supabase) {
    console.warn(
      "[OTP] SUPABASE_URL / SUPABASE_ANON_KEY not set — OTP not sent:",
      email
    );
    return { ok: false, dev: true };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    console.error("[SUPABASE OTP ERROR]", error);
    throw new Error(error.message || "Failed to send verification email");
  }

  return { ok: true };
}

/** Password reset uses the same Supabase email OTP flow */
export async function sendPasswordResetOtp(email) {
  return sendVerificationOtp(email);
}

/**
 * Verify OTP from email.
 * @param {'email' | 'recovery'} type
 */
export async function verifySupabaseOtp(email, token, type = "email") {
  const supabase = getSupabase();

  if (!supabase) {
    return { ok: false, error: "Email service not configured (Supabase)." };
  }

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type,
  });

  if (error) {
    console.error("[SUPABASE VERIFY OTP ERROR]", error);
    return { ok: false, error: error.message || "Invalid or expired code" };
  }

  return { ok: true };
}
