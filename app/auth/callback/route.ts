import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/src/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = supabaseServer();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      const email = data.session.user.email;
      const role = email === "raj.markts@gmail.com" ? "admin" : "user";

      // Store user profile with role
      await supabase.from("profiles").upsert({
        id: data.session.user.id,
        email: email,
        role: role,
        updated_at: new Date().toISOString(),
      });

      // Redirect to catalog after successful login
      return NextResponse.redirect(new URL("/catalog", request.url));
    }
  }

  // If something went wrong, redirect back to login
  return NextResponse.redirect(new URL("/login", request.url));
}
