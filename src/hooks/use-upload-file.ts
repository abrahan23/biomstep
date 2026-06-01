import * as React from "react"
import type { StoredFile } from "@/types"
import type { UploadFilesOptions } from "uploadthing/types"
import { uploadFiles } from "@/lib/uploadthing"
import { type OurFileRouter } from "@/app/api/uploadthing/core"

interface UseUploadFileProps {
  defaultUploadedFiles?: StoredFile[]
  headers?: UploadFilesOptions<OurFileRouter["productImage"]>["headers"]
  onUploadBegin?: UploadFilesOptions<OurFileRouter["productImage"]>["onUploadBegin"]
}

export function useUploadFile(
  endpoint: keyof OurFileRouter,
  { defaultUploadedFiles = [], ...props }: UseUploadFileProps = {}
) {
  const [uploadedFiles, setUploadedFiles] =
    React.useState<StoredFile[]>(defaultUploadedFiles)
  const uploadedFilesRef = React.useRef<StoredFile[]>(defaultUploadedFiles)
  const [progresses, setProgresses] = React.useState<Record<string, number>>({})
  const [isUploading, setIsUploading] = React.useState(false)

  // Sync when server-provided files change (e.g. after router.refresh()).
  // Compare by serialized value so `product.images ?? []` does not create a
  // new array reference on every render and cause an infinite update loop.
  const defaultFilesKey = JSON.stringify(defaultUploadedFiles)
  React.useEffect(() => {
    const nextFiles = JSON.parse(defaultFilesKey) as StoredFile[]
    setUploadedFiles(nextFiles)
    uploadedFilesRef.current = nextFiles
  }, [defaultFilesKey])

  async function uploadThings(files: File[]): Promise<StoredFile[]> {
    if (files.length === 0) {
      return uploadedFilesRef.current
    }

    // Use clean File instances so UploadThing can match presigned URLs reliably.
    const cleanFiles = files.map(
      (file) =>
        new File([file], file.name, {
          type: file.type,
          lastModified: file.lastModified,
        })
    )

    setIsUploading(true)
    try {
      const res = await uploadFiles(endpoint, {
        ...props,
        files: cleanFiles,
        onUploadProgress: ({ file, progress }) => {
          setProgresses((prev) => ({
            ...prev,
            [file.name]: progress,
          }))
        },
      })

      const formattedRes: StoredFile[] = res.map((file) => ({
        id: file.key,
        name: file.name,
        url: file.ufsUrl ?? file.url,
      }))

      const merged = [...uploadedFilesRef.current, ...formattedRes]
      uploadedFilesRef.current = merged
      setUploadedFiles(merged)
      return merged
    } catch (err) {
      throw err
    } finally {
      setProgresses({})
      setIsUploading(false)
    }
  }

  return {
    uploadedFiles,
    progresses,
    uploadFiles: uploadThings,
    isUploading,
  }
}
