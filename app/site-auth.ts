import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

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
    // signIn() writes cookies to start the OAuth flow, which Next.js only
    // allows from a Server Action or Route Handler — never from a plain
    // page render. Send the visitor to the login page instead, whose
    // "Sign in to Admin" button already triggers signIn() the correct way,
    // via a <form action={...}> Server Action.
    redirect(`/admin/login?return_to=${encodeURIComponent(returnTo)}`);
}
