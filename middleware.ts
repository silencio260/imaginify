import { authMiddleware, clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();
// export default authMiddleware({
//   publicRoutes: ['/api/webhooks/clerk']
// });


export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};