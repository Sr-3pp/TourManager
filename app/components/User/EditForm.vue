<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { AdminUser, UserEditFormState } from '~~/types/user'

const props = defineProps<{
  user: AdminUser
}>()

const emit = defineEmits<{
  saved: []
  cancel: []
}>()

const { updateUser } = useUser()

const schema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  email: z.string().email('El correo electrónico no es válido'),
  level: z.number().int().min(1).max(3),
  password: z.string(),
  confirmPassword: z.string(),
  bio: z.string(),
  featured: z.boolean(),
  instagram: z.string(),
  x: z.string(),
  tiktok: z.string(),
}).superRefine((data, ctx) => {
  if (data.password && data.password.length < 8) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['password'],
      message: 'La contraseña debe tener al menos 8 caracteres',
    })
  }

  if (data.password.length > 128) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['password'],
      message: 'La contraseña debe tener como máximo 128 caracteres',
    })
  }

  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['confirmPassword'],
      message: 'La confirmación de contraseña no coincide',
    })
  }
})

const isSaving = ref(false)
const errorMessage = ref('')

const form = reactive<UserEditFormState>({
  name: '',
  email: '',
  level: 1,
  password: '',
  confirmPassword: '',
  bio: '',
  featured: false,
  instagram: '',
  x: '',
  tiktok: '',
})

function syncForm(user: AdminUser) {
  errorMessage.value = ''
  form.name = user.name
  form.email = user.email
  form.level = user.level ?? 1
  form.password = ''
  form.confirmPassword = ''
  form.bio = user.profile?.bio ?? ''
  form.featured = user.profile?.featured ?? false
  form.instagram = user.profile?.social?.instagram ?? ''
  form.x = user.profile?.social?.x ?? ''
  form.tiktok = user.profile?.social?.tiktok ?? ''
}

function getUserId(user: AdminUser) {
  return user.id || user._id || ''
}

function getErrorMessage(error: unknown) {
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

  return 'No se pudo actualizar el usuario.'
}

watch(
  () => props.user,
  (user) => {
    syncForm(user)
  },
  { immediate: true, deep: true },
)

async function onSubmit(event: FormSubmitEvent<UserEditFormState>) {
  isSaving.value = true
  errorMessage.value = ''

  try {
    await updateUser(getUserId(props.user), {
      name: event.data.name,
      email: event.data.email,
      level: event.data.level,
      password: event.data.password || undefined,
      profile: {
        bio: event.data.bio,
        featured: event.data.featured,
        social: {
          instagram: event.data.instagram,
          x: event.data.x,
          tiktok: event.data.tiktok,
        },
      },
    })

    emit('saved')
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <UAlert
      v-if="errorMessage"
      color="error"
      icon="i-lucide-alert-circle"
      :title="errorMessage"
    />

    <UForm :schema="schema" :state="form" class="space-y-4" @submit="onSubmit">
      <UFormField name="name" label="Nombre">
        <UInput v-model="form.name" />
      </UFormField>

      <UFormField name="email" label="Correo electrónico">
        <UInput v-model="form.email" type="email" />
      </UFormField>

      <UFormField name="level" label="Nivel">
        <UInputNumber v-model="form.level" :min="1" :max="3" />
      </UFormField>

      <UFormField name="password" label="Nueva contraseña">
        <UInput v-model="form.password" type="password" placeholder="Déjalo en blanco para conservar la contraseña actual" />
      </UFormField>

      <UFormField name="confirmPassword" label="Confirmar nueva contraseña">
        <UInput v-model="form.confirmPassword" type="password" placeholder="Repite la nueva contraseña" />
      </UFormField>

      <UFormField name="bio" label="Biografía">
        <UTextarea v-model="form.bio" :rows="4" />
      </UFormField>

      <UFormField
        name="featured"
        label="Organizador destacado"
        description="Activa esto solo después de que el organizador haya pagado por aparecer en la portada."
      >
        <UCheckbox v-model="form.featured" label="Mostrar este organizador en la sección de organizadores destacados" />
      </UFormField>

      <UFormField name="instagram" label="Instagram">
        <UInput v-model="form.instagram" />
      </UFormField>

      <UFormField name="x" label="X">
        <UInput v-model="form.x" />
      </UFormField>

      <UFormField name="tiktok" label="TikTok">
        <UInput v-model="form.tiktok" />
      </UFormField>

      <div class="flex justify-end gap-2">
        <UButton type="button" color="neutral" variant="soft" @click="emit('cancel')">
          Cancelar
        </UButton>
        <UButton type="submit" :loading="isSaving">
          Guardar
        </UButton>
      </div>
    </UForm>
  </div>
</template>
