"use server";
import { signIn, signOut } from "@/lib/auth";

export async function googleSignIn(returnTo: string) {
  await signIn("google", { redirectTo: returnTo });
}

export async function googleSignOut(returnTo: string) {
  await signOut({ redirectTo: returnTo });
}
