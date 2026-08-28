import { type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, public assets
     * - API routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|images/|icons/|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
