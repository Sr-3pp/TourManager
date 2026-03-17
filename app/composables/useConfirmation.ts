import type { ConfirmationAction, ConfirmationOptions, ConfirmationState } from '~~/types/confirmation'

let pendingConfirmAction: ConfirmationAction | null = null
let pendingResolve: ((value: boolean) => void) | null = null

function getConfirmationErrorMessage(error: unknown) {
  if (typeof error === 'object' && error && 'data' in error) {
    const data = (error as { data?: { statusMessage?: string; message?: string } }).data

    if (data?.statusMessage) {
      return data.statusMessage
    }

    if (data?.message) {
      return data.message
    }
  }

  if (typeof error === 'object' && error && 'statusMessage' in error) {
    const statusMessage = (error as { statusMessage?: string }).statusMessage

    if (statusMessage) {
      return statusMessage
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'La acción falló.'
}

function resetConfirmationState(state: Ref<ConfirmationState>) {
  state.value = {
    open: false,
    title: '',
    description: '',
    confirmLabel: 'Confirmar',
    cancelLabel: 'Cancelar',
    color: 'primary',
    icon: 'i-lucide-circle-alert',
    loading: false,
    error: '',
  }
}

export const useConfirmation = () => {
  const state = useState<ConfirmationState>('confirmation-modal', () => ({
    open: false,
    title: '',
    description: '',
    confirmLabel: 'Confirmar',
    cancelLabel: 'Cancelar',
    color: 'primary',
    icon: 'i-lucide-circle-alert',
    loading: false,
    error: '',
  }))

  const openConfirmation = (options: ConfirmationOptions) => {
    if (pendingResolve) {
      pendingResolve(false)
    }

    state.value = {
      open: true,
      title: options.title,
      description: options.description,
      confirmLabel: options.confirmLabel || 'Confirmar',
      cancelLabel: options.cancelLabel || 'Cancelar',
      color: options.color || 'primary',
      icon: options.icon || 'i-lucide-circle-alert',
      loading: false,
      error: '',
    }

    pendingConfirmAction = options.onConfirm || null

    return new Promise<boolean>((resolve) => {
      pendingResolve = resolve
    })
  }

  const closeConfirmation = () => {
    if (state.value.loading) {
      return
    }

    pendingConfirmAction = null
    pendingResolve?.(false)
    pendingResolve = null
    resetConfirmationState(state)
  }

  const confirmAction = async () => {
    state.value.loading = true
    state.value.error = ''

    try {
      await pendingConfirmAction?.()
      pendingConfirmAction = null
      pendingResolve?.(true)
      pendingResolve = null
      resetConfirmationState(state)
    } catch (error) {
      state.value.loading = false
      state.value.error = getConfirmationErrorMessage(error)
    }
  }

  return {
    state,
    openConfirmation,
    closeConfirmation,
    confirmAction,
  }
}
