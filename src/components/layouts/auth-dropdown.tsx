import { getTranslations } from "next-intl/server"
import type { User } from "@clerk/nextjs/server"
import { DashboardIcon, ExitIcon, GearIcon } from "@radix-ui/react-icons"

import { Link } from "@/i18n/routing"
import { isAdmin } from "@/lib/auth"
import { cn, getUserEmail } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, type ButtonProps } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/icons"

interface AuthDropdownProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuTrigger>,
    ButtonProps {
  user: User | null
}

export async function AuthDropdown({
  user,
  className,
  ...props
}: AuthDropdownProps) {
  const t = await getTranslations("Auth")

  if (!user) {
    return (
      <Button size="sm" className={cn(className)} {...props} asChild>
        <Link href="/signin">
          {t("signIn")}
          <span className="sr-only">{t("signInSr")}</span>
        </Link>
      </Button>
    )
  }

  const initials = `${user.firstName?.charAt(0) ?? ""} ${
    user.lastName?.charAt(0) ?? ""
  }`
  const email = getUserEmail(user)
  const userIsAdmin = isAdmin(user)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          className={cn("size-8 rounded-full", className)}
          {...props}
        >
          <Avatar className="size-8">
            <AvatarImage src={user.imageUrl} alt={user.username ?? ""} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {userIsAdmin ? (
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <DashboardIcon className="mr-2 size-4" aria-hidden="true" />
                {t("admin")}
                <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem asChild>
            <Link href="/account">
              <Icons.dollarSign className="mr-2 size-4" aria-hidden="true" />
              {t("myOrders")}
              <DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/account">
              <GearIcon className="mr-2 size-4" aria-hidden="true" />
              {t("account")}
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/signout">
            <ExitIcon className="mr-2 size-4" aria-hidden="true" />
            {t("logOut")}
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
