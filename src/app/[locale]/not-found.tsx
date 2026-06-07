import { getLocale, getTranslations } from "next-intl/server"

import { NotFoundScene } from "@/components/not-found-scene"

export default async function NotFound() {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: "NotFound" })

  return (
    <NotFoundScene
      title={t("title")}
      description={t("description")}
      homeLabel={t("home")}
      catalogLabel={t("catalog")}
    />
  )
}
