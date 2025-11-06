import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          res.cookies.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const url = req.nextUrl;
  const path = url.pathname;
  const hasSbAccessCookie = Boolean(req.cookies.get("sb-access-token")?.value);

  const isProtected = path.startsWith("/dashboard") || path.startsWith("/ideas");
  const isPublicGate =
    path === "/" || path.startsWith("/login") || path.startsWith("/register");

  if (isProtected) {
    if (session || hasSbAccessCookie) return res;
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (isPublicGate && session) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/", "/login", "/register", "/dashboard/:path*", "/ideas/:path*"],
};