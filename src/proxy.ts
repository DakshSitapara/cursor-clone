import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// // if you went to make unauthroized user to direct to sign in page than remove this comments in the clerkMiddleware add comment the second argument and add this code in that

// const isPublicRoute = createRouteMatcher([
//   "/api/inngest(.*)",
// ])

// export default clerkMiddleware(
//   async (auth, req) => {
    
//     if(!isPublicRoute(req)) {
//       await auth.protect();
//     }
// })

export default clerkMiddleware()

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}