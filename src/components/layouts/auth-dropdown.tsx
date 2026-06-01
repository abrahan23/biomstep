import { getTranslations } from "next-intl/server"
import type { User } from "@clerk/nextjs/server"

import { isAdmin } from "@/lib/auth"
import { getUserEmail } from "@/lib/utils"
import { AuthDropdownMenu } from "@/components/layouts/auth-dropdown-menu"

interface AuthDropdownProps
  extends React.ComponentPropsWithoutRef<
    typeof AuthDropdownMenu
  > {
  user: User | null
}

export async function AuthDropdown({ user, ...props }: AuthDropdownProps) {
  const t = await getTranslations("Auth")

  return (
    <AuthDropdownMenu
      user={
        user
          ? {
              firstName: user.firstName,
              lastName: user.lastName,
              imageUrl: user.imageUrl,
              username: user.username,
              email: getUserEmail(user),
              isAdmin: isAdmin(user),
            }
          : null
      }
      labels={{
        signIn: t("signIn"),
        signInSr: t("signInSr"),
        admin: t("admin"),
        myOrders: t("myOrders"),
        account: t("account"),
        logOut: t("logOut"),
      }}
      {...props}
    />
  )
}
