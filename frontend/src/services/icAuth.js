import { AuthClient } from "@dfinity/auth-client";

let authClient = null;

export const II_URL = {
  local: "http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943",
  playground:
    "https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=rdmx6-jaaaa-aaaaa-aaadq-cai",
  ic: "https://identity.ic0.app",
};

// Initialize the AuthClient (singleton)
export async function initializeAuthClient() {
  if (!authClient) {
    authClient = await AuthClient.create();
  }
  return authClient;
}

// Authenticate with Internet Identity
export async function authenticate(identityProviderUrl) {
  const client = await initializeAuthClient();
  const isAuthenticated = await client.isAuthenticated();

  if (!isAuthenticated) {
    await new Promise((resolve, reject) => {
      client.login({
        identityProvider: identityProviderUrl,
        onSuccess: resolve,
        onError: reject,
        windowOpenerFeatures: `
          left=${window.screen.width / 2 - 525 / 2},
          top=${window.screen.height / 2 - 705 / 2},
          toolbar=0,location=0,menubar=0,width=525,height=705
        `,
      });
    });
  }

  return client.getIdentity();
}

// Get current user’s principal ID
export async function getPrincipal() {
  const client = await initializeAuthClient();
  if (await client.isAuthenticated()) {
    return client.getIdentity().getPrincipal().toText();
  }
  return null;
}

// Logout and clear session
export async function logout() {
  const client = await initializeAuthClient();
  await client.logout();
}
