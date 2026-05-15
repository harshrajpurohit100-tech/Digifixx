import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseConfig, hasSupabaseConfig } from "@/lib/supabase/config";

const LOGIN_PATH = "/admin/login";
const DASHBOARD_PATH = "/admin/dashboard";

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = LOGIN_PATH;

  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (request.nextUrl.pathname !== LOGIN_PATH) {
    url.searchParams.set("next", nextPath);
  }

  return NextResponse.redirect(url);
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname === LOGIN_PATH;

  if (!hasSupabaseConfig()) {
    if (isAdminRoute && !isLoginRoute) {
      return redirectToLogin(request);
    }

    return response;
  }

  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isAdminRoute && !isLoginRoute && !user) {
    return redirectToLogin(request);
  }

  if (isLoginRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = DASHBOARD_PATH;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
