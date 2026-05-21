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
 * Send a 6-digit OTP to the given email via Supabase Auth.
 * Supabase generates and delivers the OTP; we later verify it with verifySupabaseOtp().
 *
 * @param {string} email
 * @returns {{ ok: boolean, dev?: boolean }}
 */
export async function sendVerificationOtp(email) {
  const supabase = getSupabase();

  if (!supabase) {
    console.warn("[EMAIL] SUPABASE_URL / SUPABASE_ANON_KEY not set — OTP email not sent:", email);
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

/**
 * Send a password-reset OTP via Supabase Auth (reuses the same signInWithOtp flow).
 *
 * @param {string} email
 * @returns {{ ok: boolean, dev?: boolean }}
 */
export async function sendPasswordResetOtp(email) {
  return sendVerificationOtp(email);
}

/**
 * Verify a Supabase OTP token for the given email.
 *
 * @param {string} email
 * @param {string} token  — the 6-digit code the user entered
 * @returns {{ ok: boolean, error?: string }}
 */
export async function verifySupabaseOtp(email, token) {
  const supabase = getSupabase();

  if (!supabase) {
    console.warn("[EMAIL] Supabase not configured — skipping OTP verification");
    return { ok: false, error: "Email service not configured" };
  }

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    console.error("[SUPABASE VERIFY OTP ERROR]", error);
    return { ok: false, error: error.message || "Invalid or expired code" };
  }

  return { ok: true };
}
