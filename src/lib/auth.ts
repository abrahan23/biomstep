import "server-only"

import { cache } from "react"
import { currentUser, type User } from "@clerk/nextjs/server"

import type { UserRole } from "@/lib/validations/auth"

/**
 * Cached Clerk user for the current request.
 * @see https://react.dev/reference/react/cache
 */
export const getCachedUser = cache(currentUser)

/**
 * Reads the role stored in the user's Clerk public metadata.
 * Admins are designated by setting `publicMetadata.role = "admin"` in the
 * Clerk dashboard (or via the API).
 */
export function getUserRole(user: User | null): UserRole {
  const role = user?.publicMetadata?.role
  return role === "admin" ? "admin" : "user"
}

export function isAdmin(user: User | null): boolean {
  return getUserRole(user) === "admin"
}

export async function getCurrentUserRole(): Promise<UserRole> {
  const user = await getCachedUser()
  return getUserRole(user)
}

export async function getIsAdmin(): Promise<boolean> {
  const user = await getCachedUser()
  return isAdmin(user)
}
