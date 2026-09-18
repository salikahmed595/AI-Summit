import { auth, signIn } from "@/lib/auth";

export type SiteUser = {
    userId: string;
    displayName: string;
    email: string;
    fullName: string | null;
};

export async function getSiteUser(): Promise<SiteUser | null> {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) return null;
    const name = session?.user?.name ?? null;
    return { userId: email, displayName: name ?? email, email, fullName: name };
}

export async function requireSiteUser(returnTo: string): Promise<SiteUser> {
    const user = await getSiteUser();
    if (user) return user;
    await signIn("google", { redirectTo: returnTo });
    throw new Error("Redirecting to sign in");
}
