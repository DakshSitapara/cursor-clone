import { AuthConfig } from "convex/server";

const getIssuerDomain = (): string => {
  const domain = process.env.CLERK_JWT_ISSUER_DOMAIN;
  if (!domain) {
    throw new Error("CLERK_JWT_ISSUER_DOMAIN not configured");
  }
  return domain;
};

export default {
  providers: [
    {
      // Replace with your own Clerk Issuer URL from your "convex" JWT template
      // or with `process.env.CLERK_JWT_ISSUER_DOMAIN`
      // and configure CLERK_JWT_ISSUER_DOMAIN on the Convex Dashboard
      // See https://docs.convex.dev/auth/clerk#configuring-dev-and-prod-instances
      domain: getIssuerDomain(),
      applicationID: "convex",
    },
  ]
} satisfies AuthConfig;