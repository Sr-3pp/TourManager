export type ConfirmationAction = () => void | Promise<void>

export type ConfirmationColor = 'error' | 'primary' | 'secondary' | 'neutral' | 'success' | 'warning'

export type ConfirmationOptions = {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  color?: ConfirmationColor
  icon?: string
  onConfirm?: ConfirmationAction
}

export type ConfirmationState = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  color: ConfirmationColor
  icon: string
  loading: boolean
  error: string
}
