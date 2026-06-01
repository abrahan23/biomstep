"use client"

import { DashboardIcon, ExitIcon, GearIcon } from "@radix-ui/react-icons"

import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"
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

interface AuthDropdownLabels {
  signIn: string
  signInSr: string
  admin: string
  myOrders: string
  account: string
  logOut: string
}

interface AuthDropdownUser {
  firstName: string | null
  lastName: string | null
  imageUrl: string
  username: string | null
  email: string
  isAdmin: boolean
}

interface AuthDropdownMenuProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuTrigger>,
    ButtonProps {
  user: AuthDropdownUser | null
  labels: AuthDropdownLabels
}

export function AuthDropdownMenu({
  user,
  labels,
  className,
  ...props
}: AuthDropdownMenuProps) {
  if (!user) {
    return (
      <Button size="sm" className={cn(className)} {...props} asChild>
        <Link href="/signin">
          {labels.signIn}
          <span className="sr-only">{labels.signInSr}</span>
        </Link>
      </Button>
    )
  }

  const initials = `${user.firstName?.charAt(0) ?? ""}${
    user.lastName?.charAt(0) ?? ""
  }`

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
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {user.isAdmin ? (
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <DashboardIcon className="mr-2 size-4" aria-hidden="true" />
                {labels.admin}
                <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem asChild>
            <Link href="/account">
              <Icons.dollarSign className="mr-2 size-4" aria-hidden="true" />
              {labels.myOrders}
              <DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/account">
              <GearIcon className="mr-2 size-4" aria-hidden="true" />
              {labels.account}
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/signout">
            <ExitIcon className="mr-2 size-4" aria-hidden="true" />
            {labels.logOut}
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
