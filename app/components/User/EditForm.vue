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
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().email('Email is invalid'),
  level: z.number().int().min(1).max(3),
  password: z.string(),
  confirmPassword: z.string(),
  bio: z.string(),
  instagram: z.string(),
  x: z.string(),
  tiktok: z.string(),
}).superRefine((data, ctx) => {
  if (data.password && data.password.length < 8) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['password'],
      message: 'Password must be at least 8 characters',
    })
  }

  if (data.password.length > 128) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['password'],
      message: 'Password must be at most 128 characters',
    })
  }

  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['confirmPassword'],
      message: 'Password confirmation does not match',
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

  return 'Failed to update user.'
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
      <UFormField name="name" label="Name">
        <UInput v-model="form.name" />
      </UFormField>

      <UFormField name="email" label="Email">
        <UInput v-model="form.email" type="email" />
      </UFormField>

      <UFormField name="level" label="Level">
        <UInputNumber v-model="form.level" :min="1" :max="3" />
      </UFormField>

      <UFormField name="password" label="New Password">
        <UInput v-model="form.password" type="password" placeholder="Leave blank to keep current password" />
      </UFormField>

      <UFormField name="confirmPassword" label="Confirm New Password">
        <UInput v-model="form.confirmPassword" type="password" placeholder="Repeat the new password" />
      </UFormField>

      <UFormField name="bio" label="Bio">
        <UTextarea v-model="form.bio" :rows="4" />
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
          Cancel
        </UButton>
        <UButton type="submit" :loading="isSaving">
          Save
        </UButton>
      </div>
    </UForm>
  </div>
</template>
