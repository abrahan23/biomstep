"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ChevronDownIcon,
  ChevronUpIcon,
  DotsHorizontalIcon,
  PlusIcon,
} from "@radix-ui/react-icons"
import { toast } from "sonner"

import {
  createCategory,
  createSubcategory,
  deleteCategory,
  deleteSubcategory,
  reorderCategories,
  reorderSubcategories,
  type getAdminCatalog,
  updateCategory,
  updateSubcategory,
} from "@/lib/actions/category"
import { slugify } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type AdminCatalog = Awaited<ReturnType<typeof getAdminCatalog>>
type AdminCategory = AdminCatalog[number]
type AdminSubcategory = AdminCategory["subcategories"][number]

interface CatalogManagerProps {
  catalog: AdminCatalog
}

type DialogMode =
  | { type: "create-category" }
  | { type: "edit-category"; category: AdminCategory }
  | { type: "create-subcategory"; categoryId: string; categoryName: string }
  | { type: "edit-subcategory"; subcategory: AdminSubcategory; categoryName: string }

type DeleteTarget =
  | { type: "category"; id: string; name: string }
  | { type: "subcategory"; id: string; name: string }

function moveItem<T extends { id: string }>(
  items: T[],
  id: string,
  direction: "up" | "down"
) {
  const index = items.findIndex((item) => item.id === id)
  if (index === -1) return items

  const targetIndex = direction === "up" ? index - 1 : index + 1
  if (targetIndex < 0 || targetIndex >= items.length) return items

  const next = [...items]
  const [item] = next.splice(index, 1)
  next.splice(targetIndex, 0, item!)

  return next
}

export function CatalogManager({ catalog }: CatalogManagerProps) {
  const router = useRouter()
  const [dialog, setDialog] = React.useState<DialogMode | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<DeleteTarget | null>(
    null
  )
  const [isPending, startTransition] = React.useTransition()

  const [name, setName] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [image, setImage] = React.useState("")
  const [slugTouched, setSlugTouched] = React.useState(false)

  React.useEffect(() => {
    if (!dialog) return

    if (dialog.type === "create-category") {
      setName("")
      setSlug("")
      setDescription("")
      setImage("")
      setSlugTouched(false)
      return
    }

    if (dialog.type === "edit-category") {
      setName(dialog.category.name)
      setSlug(dialog.category.slug)
      setDescription(dialog.category.description ?? "")
      setImage(dialog.category.image ?? "")
      setSlugTouched(true)
      return
    }

    if (dialog.type === "create-subcategory") {
      setName("")
      setSlug("")
      setDescription("")
      setImage("")
      setSlugTouched(false)
      return
    }

    if (dialog.type === "edit-subcategory") {
      setName(dialog.subcategory.name)
      setSlug(dialog.subcategory.slug)
      setDescription(dialog.subcategory.description ?? "")
      setImage("")
      setSlugTouched(true)
    }
  }, [dialog])

  function refresh() {
    router.refresh()
  }

  function handleNameChange(value: string) {
    setName(value)
    if (!slugTouched) {
      setSlug(slugify(value))
    }
  }

  function handleSubmit() {
    if (!dialog) return

    startTransition(async () => {
      if (dialog.type === "create-category") {
        const result = await createCategory({
          name,
          slug,
          description,
          image,
        })
        if (result.error) {
          toast.error(result.error)
          return
        }
        toast.success("Categoría creada")
      }

      if (dialog.type === "edit-category") {
        const result = await updateCategory({
          id: dialog.category.id,
          name,
          slug,
          description,
          image,
        })
        if (result.error) {
          toast.error(result.error)
          return
        }
        toast.success("Categoría actualizada")
      }

      if (dialog.type === "create-subcategory") {
        const result = await createSubcategory({
          name,
          slug,
          description,
          categoryId: dialog.categoryId,
        })
        if (result.error) {
          toast.error(result.error)
          return
        }
        toast.success("Subcategoría creada")
      }

      if (dialog.type === "edit-subcategory") {
        const result = await updateSubcategory({
          id: dialog.subcategory.id,
          name,
          slug,
          description,
          categoryId: dialog.subcategory.categoryId,
        })
        if (result.error) {
          toast.error(result.error)
          return
        }
        toast.success("Subcategoría actualizada")
      }

      setDialog(null)
      refresh()
    })
  }

  function handleDelete() {
    if (!deleteTarget) return

    startTransition(async () => {
      const result =
        deleteTarget.type === "category"
          ? await deleteCategory({ id: deleteTarget.id })
          : await deleteSubcategory({ id: deleteTarget.id })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success("Eliminado correctamente")
      setDeleteTarget(null)
      refresh()
    })
  }

  function handleReorderCategory(id: string, direction: "up" | "down") {
    const next = moveItem(catalog, id, direction)
    if (next === catalog) return

    startTransition(async () => {
      const result = await reorderCategories({
        orderedIds: next.map((category) => category.id),
      })
      if (result.error) {
        toast.error(result.error)
        return
      }
      refresh()
    })
  }

  function handleReorderSubcategory(
    categoryId: string,
    id: string,
    direction: "up" | "down"
  ) {
    const category = catalog.find((item) => item.id === categoryId)
    if (!category) return

    const next = moveItem(category.subcategories, id, direction)
    if (next === category.subcategories) return

    startTransition(async () => {
      const result = await reorderSubcategories({
        categoryId,
        orderedIds: next.map((subcategory) => subcategory.id),
      })
      if (result.error) {
        toast.error(result.error)
        return
      }
      refresh()
    })
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          El orden aquí define el menú de navegación y las colecciones.
        </p>
        <Button
          size="sm"
          onClick={() => setDialog({ type: "create-category" })}
          disabled={isPending}
        >
          <PlusIcon className="mr-2 size-4" aria-hidden="true" />
          Nueva categoría
        </Button>
      </div>

      <div className="space-y-4">
        {catalog.map((category, categoryIndex) => (
          <Card key={category.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-4">
              <div className="space-y-1">
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">/{category.slug}</Badge>
                  <span>Menú #{categoryIndex + 1}</span>
                </div>
                {category.description ? (
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  disabled={isPending || categoryIndex === 0}
                  onClick={() => handleReorderCategory(category.id, "up")}
                  aria-label="Subir categoría"
                >
                  <ChevronUpIcon className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  disabled={
                    isPending || categoryIndex === catalog.length - 1
                  }
                  onClick={() => handleReorderCategory(category.id, "down")}
                  aria-label="Bajar categoría"
                >
                  <ChevronDownIcon className="size-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label="Opciones de categoría"
                    >
                      <DotsHorizontalIcon className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        setDialog({ type: "edit-category", category })
                      }
                    >
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setDialog({
                          type: "create-subcategory",
                          categoryId: category.id,
                          categoryName: category.name,
                        })
                      }
                    >
                      Añadir subcategoría
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() =>
                        setDeleteTarget({
                          type: "category",
                          id: category.id,
                          name: category.name,
                        })
                      }
                    >
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {category.subcategories.length ? (
                category.subcategories.map((subcategory, subcategoryIndex) => (
                  <div
                    key={subcategory.id}
                    className="flex items-start justify-between gap-3 rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{subcategory.name}</p>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary">
                          /{category.slug}/{subcategory.slug}
                        </Badge>
                        <span>#{subcategoryIndex + 1}</span>
                      </div>
                      {subcategory.description ? (
                        <p className="text-sm text-muted-foreground">
                          {subcategory.description}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        disabled={isPending || subcategoryIndex === 0}
                        onClick={() =>
                          handleReorderSubcategory(
                            category.id,
                            subcategory.id,
                            "up"
                          )
                        }
                        aria-label="Subir subcategoría"
                      >
                        <ChevronUpIcon className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        disabled={
                          isPending ||
                          subcategoryIndex === category.subcategories.length - 1
                        }
                        onClick={() =>
                          handleReorderSubcategory(
                            category.id,
                            subcategory.id,
                            "down"
                          )
                        }
                        aria-label="Bajar subcategoría"
                      >
                        <ChevronDownIcon className="size-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-label="Opciones de subcategoría"
                          >
                            <DotsHorizontalIcon className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              setDialog({
                                type: "edit-subcategory",
                                subcategory,
                                categoryName: category.name,
                              })
                            }
                          >
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() =>
                              setDeleteTarget({
                                type: "subcategory",
                                id: subcategory.id,
                                name: subcategory.name,
                              })
                            }
                          >
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sin subcategorías. Solo aparecerá &quot;Todos&quot; en el menú.
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialog !== null} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog?.type === "create-category" && "Nueva categoría"}
              {dialog?.type === "edit-category" && "Editar categoría"}
              {dialog?.type === "create-subcategory" &&
                `Nueva subcategoría · ${dialog.categoryName}`}
              {dialog?.type === "edit-subcategory" &&
                `Editar subcategoría · ${dialog.categoryName}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="catalog-name">Nombre</Label>
              <Input
                id="catalog-name"
                value={name}
                onChange={(event) => handleNameChange(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catalog-slug">Slug (URL)</Label>
              <Input
                id="catalog-slug"
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true)
                  setSlug(event.target.value)
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catalog-description">Descripción</Label>
              <Textarea
                id="catalog-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            {dialog?.type === "create-category" ||
            dialog?.type === "edit-category" ? (
              <div className="space-y-2">
                <Label htmlFor="catalog-image">Imagen (ruta o URL)</Label>
                <Input
                  id="catalog-image"
                  value={image}
                  onChange={(event) => setImage(event.target.value)}
                  placeholder="/images/categories/ejemplo.webp"
                />
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isPending || !name || !slug}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === "category"
                ? "Solo se puede eliminar si no tiene productos asignados. Las subcategorías también se eliminarán."
                : "Solo se puede eliminar si no tiene productos asignados."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
