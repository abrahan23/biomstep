import { toast } from "sonner"
import * as z from "zod"

import { unknownError } from "@/lib/constants"

function isClerkAPIResponseError(
  err: unknown
): err is { errors: Array<{ longMessage?: string }> } {
  return typeof err === "object" && err !== null && "clerkError" in err
}

export function getErrorMessage(err: unknown) {
  if (err instanceof z.ZodError) {
    return err.errors[0]?.message ?? unknownError
  } else if (isClerkAPIResponseError(err)) {
    return err.errors[0]?.longMessage ?? unknownError
  } else if (err instanceof Error) {
    return err.message
  } else {
    return unknownError
  }
}

export function showErrorToast(err: unknown) {
  const errorMessage = getErrorMessage(err)
  console.log({ errorMessage })

  return toast.error(errorMessage)
}
