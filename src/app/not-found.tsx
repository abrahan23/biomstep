import { NotFoundScene } from "@/components/not-found-scene"

export default function NotFound() {
  return (
    <NotFoundScene
      title="Pisada en falso"
      description="Esta página no existe o fue movida. Vuelve al inicio para encontrar lo que buscas."
      homeLabel="Volver al inicio"
      catalogLabel="Ver catálogo"
    />
  )
}
