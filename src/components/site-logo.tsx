import Image from "next/image"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

const LOGO_SRC = "/images/logo/logo-biomstep.svg"

interface SiteLogoProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Image>,
    "src" | "alt" | "width" | "height"
  > {}

export function SiteLogo({ className, ...props }: SiteLogoProps) {
  return (
    <Image
      src={LOGO_SRC}
      alt={siteConfig.name}
      width={898}
      height={278}
      className={cn("w-auto", className)}
      {...props}
    />
  )
}
