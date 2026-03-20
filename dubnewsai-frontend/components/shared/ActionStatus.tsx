"use client"

function getErrorMessage(error: unknown) {
  if (!error) {
    return null
  }

  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { detail?: string } } }).response
    if (response?.data?.detail) {
      return response.data.detail
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return "Something went wrong. Please try again."
}

export function ActionStatus({
  isPending,
  isSuccess,
  error,
  successMessage
}: {
  isPending: boolean
  isSuccess?: boolean
  error?: unknown
  successMessage?: string
}) {
  const errorMessage = getErrorMessage(error)

  if (isPending) {
    return <p className="mt-3 text-sm text-white/50">Saving...</p>
  }

  if (errorMessage) {
    return <p className="mt-3 text-sm text-rose-300">{errorMessage}</p>
  }

  if (isSuccess && successMessage) {
    return <p className="mt-3 text-sm text-emerald-300">{successMessage}</p>
  }

  return null
}
