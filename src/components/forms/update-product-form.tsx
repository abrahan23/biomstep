"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { type Product } from "@/db/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { deleteProduct, updateProduct } from "@/lib/actions/product"
import { getErrorMessage } from "@/lib/handle-error"
import {
  type getCategories,
  type getSubcategories,
} from "@/lib/queries/product"
import {
  updateProductSchema,
  type UpdateProductSchema,
} from "@/lib/validations/product"
import { useUploadFile } from "@/hooks/use-upload-file"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  UncontrolledFormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FileUploader } from "@/components/file-uploader"
import { Files } from "@/components/files"
import { Icons } from "@/components/icons"

interface UpdateProductFormProps {
  product: Product
  promises: Promise<{
    categories: Awaited<ReturnType<typeof getCategories>>
    subcategories: Awaited<ReturnType<typeof getSubcategories>>
  }>
}

export function UpdateProductForm({
  product,
  promises,
}: UpdateProductFormProps) {
  const { categories, subcategories } = React.use(promises)

  const router = useRouter()
  const [isUpdating, setIsUpdating] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false)
  const { uploadFiles, progresses, uploadedFiles, isUploading } = useUploadFile(
    "productImage",
    {
      defaultUploadedFiles: product.images ?? [],
    }
  )

  const form = useForm<UpdateProductSchema>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      name: product.name,
      description: product.description ?? "",
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId,
      price: product.price,
      inventory: product.inventory,
      images: [],
    },
  })

  async function persistProductImages(files: File[]) {
    const images = await uploadFiles(files)
    const values = form.getValues()
    const result = await updateProduct({
      ...values,
      storeId: product.storeId,
      id: product.id,
      images,
    })
    if (result.error) throw new Error(result.error)
    form.setValue("images", [])
    router.refresh()
    return images
  }

  async function handleImageUpload(files: File[]) {
    await toast.promise(persistProductImages(files), {
      loading:
        files.length === 1
          ? "Uploading image..."
          : `Uploading ${files.length} images...`,
      success: () => {
        setUploadDialogOpen(false)
        return files.length === 1
          ? "Image saved to product"
          : `${files.length} images saved to product`
      },
      error: (err) => getErrorMessage(err),
    })
  }

  function onSubmit(input: UpdateProductSchema) {
    setIsUpdating(true)

    toast.promise(
      (async () => {
        const pendingImages = input.images ?? []
        const images =
          pendingImages.length > 0
            ? await persistProductImages(pendingImages)
            : await uploadFiles([])

        if (pendingImages.length === 0) {
          const { images: _files, ...rest } = input
          const result = await updateProduct({
            ...rest,
            storeId: product.storeId,
            id: product.id,
            images,
          })
          if (result.error) throw new Error(result.error)
          router.refresh()
        }
      })(),
      {
        loading: "Saving product...",
        success: () => {
          setIsUpdating(false)
          return "Product updated"
        },
        error: (err) => {
          setIsUpdating(false)
          return getErrorMessage(err)
        },
      }
    )
  }

  return (
    <Form {...form}>
      <form
        className="grid w-full max-w-2xl gap-5"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Type product name here." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Type product description here."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col items-start gap-6 sm:flex-row">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(value: typeof field.value) =>
                      field.onChange(value)
                    }
                    defaultValue={product.categoryId}
                  >
                    <SelectTrigger className="capitalize">
                      <SelectValue placeholder={field.value} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {categories.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subcategoryId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Subcategory</FormLabel>
                <FormControl>
                  <Select
                    value={field.value?.toString()}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="capitalize">
                      <SelectValue placeholder={field.value} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {subcategories.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col items-start gap-6 sm:flex-row">
          <FormItem className="w-full">
            <FormLabel>Price</FormLabel>
            <FormControl>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="Type product price here."
                {...form.register("price")}
                defaultValue={product.price}
              />
            </FormControl>
            <UncontrolledFormMessage
              message={form.formState.errors.price?.message}
            />
          </FormItem>
          <FormItem className="w-full">
            <FormLabel>Inventory</FormLabel>
            <FormControl>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="Type product inventory here."
                {...form.register("inventory", {
                  valueAsNumber: true,
                })}
                defaultValue={product.inventory}
              />
            </FormControl>
            <UncontrolledFormMessage
              message={form.formState.errors.inventory?.message}
            />
          </FormItem>
        </div>
        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <div className="space-y-4">
              <FormItem className="w-full">
                <FormLabel>Images</FormLabel>
                <p className="text-sm text-muted-foreground">
                  {uploadedFiles.length > 0
                    ? `${uploadedFiles.length} image${uploadedFiles.length === 1 ? "" : "s"} on this product.`
                    : "No images yet."}{" "}
                  Select files below — they upload and save automatically.
                </p>
                <FormControl>
                  <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" disabled={isUploading}>
                        {isUploading ? (
                          <>
                            <Icons.spinner
                              className="mr-2 size-4 animate-spin"
                              aria-hidden="true"
                            />
                            Uploading...
                          </>
                        ) : (
                          "Add images"
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl">
                      <DialogHeader>
                        <DialogTitle>Add product images</DialogTitle>
                        <DialogDescription>
                          Drag and drop or browse. Images upload to the server
                          as soon as you select them.
                        </DialogDescription>
                      </DialogHeader>
                      <FileUploader
                        value={field.value ?? []}
                        onValueChange={field.onChange}
                        onUpload={handleImageUpload}
                        suppressUploadToast
                        maxFiles={4}
                        maxSize={4 * 1024 * 1024}
                        progresses={progresses}
                        disabled={isUploading || isUpdating}
                      />
                    </DialogContent>
                  </Dialog>
                </FormControl>
                <FormMessage />
              </FormItem>
              {uploadedFiles.length > 0 ? (
                <Files files={uploadedFiles} />
              ) : null}
            </div>
          )}
        />
        <div className="flex space-x-2">
          <Button type="submit" disabled={isDeleting || isUpdating || isUploading}>
            {isUpdating && (
              <Icons.spinner
                className="mr-2 size-4 animate-spin"
                aria-hidden="true"
              />
            )}
            Update Product
            <span className="sr-only">Update product</span>
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              setIsDeleting(true)

              toast.promise(
                deleteProduct({
                  storeId: product.storeId,
                  id: product.id,
                }),
                {
                  loading: "Deleting product...",
                  success: () => {
                    void form.trigger(["name", "price", "inventory"])
                    router.push(`/admin/products`)
                    setIsDeleting(false)
                    return "Product deleted"
                  },
                  error: (err) => {
                    setIsDeleting(false)
                    return getErrorMessage(err)
                  },
                }
              )
            }}
            disabled={isDeleting}
          >
            {isDeleting && (
              <Icons.spinner
                className="mr-2 size-4 animate-spin"
                aria-hidden="true"
              />
            )}
            Delete Product
            <span className="sr-only">Delete product</span>
          </Button>
        </div>
      </form>
    </Form>
  )
}
