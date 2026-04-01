<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { OrganizerProfileFormState, Profile } from '~~/types/profile'

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024

const organizerProfileSchema = z.object({
    bio: z.string().max(500, 'La biografía es demasiado larga').optional().default(''),
    instagram: z.string().max(100).optional().default(''),
    tiktok: z.string().max(100).optional().default(''),
    x: z.string().max(100).optional().default(''),
})

const {
    profile,
    isLoading,
    isSaving,
    errorMessage,
    successMessage,
    loadProfile,
    saveProfile,
} = useProfile()

const draft = reactive<OrganizerProfileFormState>({
    bio: '',
    instagram: '',
    tiktok: '',
    x: '',
})

const pictureFile = ref<File | null>(null)
const bannerFile = ref<File | null>(null)

function mapProfileToDraft(profileData: Profile | undefined) {
    draft.bio = profileData?.bio ?? ''
    draft.instagram = profileData?.social?.instagram ?? ''
    draft.x = profileData?.social?.x ?? ''
    draft.tiktok = profileData?.social?.tiktok ?? ''
}

watch(pictureFile, (file, previousFile) => {
    if (file && file.size > MAX_UPLOAD_SIZE_BYTES) {
        errorMessage.value = 'La foto de perfil debe pesar menos de 10 MB (se comprimirá automáticamente).'
        pictureFile.value = null
        return
    }
})

async function onSubmit(event: FormSubmitEvent<OrganizerProfileFormState>) {
    const ok = await saveProfile(event.data, {
        pictureFile: pictureFile.value,
        bannerFile: bannerFile.value,
    })

    if (ok) {
        pictureFile.value = null
        bannerFile.value = null
        mapProfileToDraft(profile.value)
    }
}

async function syncDraft(options?: { force?: boolean }) {
    await loadProfile(options)
    mapProfileToDraft(profile.value)
}

onMounted(() => syncDraft())

</script>

<template>
    <div class="max-w-2xl space-y-4">
        <UAlert
            v-if="errorMessage"
            color="error"
            icon="i-lucide-alert-circle"
            :title="errorMessage"
        />

        <UAlert
            v-if="successMessage"
            color="success"
            icon="i-lucide-check-circle"
            :title="successMessage"
        />

        <UForm
            :schema="organizerProfileSchema"
            :state="draft"
            class="space-y-4"
            @submit="onSubmit"
        >
            <UCard>
                <div class="space-y-5">
                    <FormSectionHeader
                        title="Identidad visual"
                        description="Actualiza el banner y la foto que representan tu perfil público."
                        badge="Media"
                        badge-color="secondary"
                    />

                    <div class="flex flex-col gap-6">
                        <UFormField name="banner" label="Banner (máx. 10 MB)" class="relative">
                                <UFileUpload
                                    v-model="bannerFile"
                                    class="w-full relative z-10 h-full"
                                    accept="image/*"
                                    :preview="false"
                                    label="Selecciona un banner"
                                    description="PNG, JPG o WEBP de hasta 10 MB"
                                    :ui="{ base: 'bg-gradient-to-t from-[var(--ui-bg-muted)] to-transparent' }"
                                />
                                <NuxtImg
                                    v-if="profile?.banner"
                                    :src="`/blob/${profile.banner}`"
                                    alt="Banner actual"
                                    class="absolute inset-0 h-full w-full object-cover rounded-lg"
                                />
                        </UFormField>

                        <div class="flex gap-4 items-center">
                            <NuxtImg
                                v-if="profile?.picture"
                                :src="`/blob/${profile.picture}`"
                                alt="Foto de perfil actual"
                                class="h-28 w-28 rounded-full object-cover flex-shrink-0"
                            />
                            <UFormField name="picture" label="Foto de perfil (máx. 10 MB)" class="w-full">
                                    <UFileUpload
                                        v-model="pictureFile"
                                        class="w-full"
                                        accept="image/*"
                                        :preview="false"
                                        label="Selecciona una foto"
                                        description="PNG, JPG o WEBP de hasta 10 MB"
                                        :ui="{ base: 'bg-gradient-to-t from-[var(--ui-bg-muted)] to-transparent' }"
                                    />
    
                                </UFormField>
                        </div>

                    </div>
                </div>
            </UCard>

            <UCard>
                <div class="space-y-5">
                    <FormSectionHeader
                        title="Perfil público"
                        description="Define tu presentación y los enlaces sociales que verán los viajeros."
                        badge="Perfil"
                        badge-color="primary"
                    />

                    <UFormField name="bio" label="Biografía">
                        <UTextarea class="w-full" v-model="draft.bio" :rows="5" placeholder="Cuéntale a la gente sobre tu trabajo..." />
                    </UFormField>

                    <USeparator />

                    <div class="space-y-3">
                        <FormSectionHeader
                            title="Redes sociales"
                            description="Comparte tus canales principales para que te encuentren con facilidad."
                            badge="3 campos"
                        />

                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <UFormField name="instagram" label="Instagram">
                                <UInput v-model="draft.instagram" placeholder="@tuusuario" class="w-full" />
                            </UFormField>

                            <UFormField name="x" label="X">
                                <UInput v-model="draft.x" placeholder="@tuusuario" class="w-full" />
                            </UFormField>

                            <UFormField name="tiktok" label="TikTok" class="sm:col-span-2">
                                <UInput v-model="draft.tiktok" placeholder="@tuusuario" class="w-full" />
                            </UFormField>
                        </div>
                    </div>
                </div>
            </UCard>

            <div class="flex gap-3 justify-end">
                <UButton type="submit" :loading="isSaving" :disabled="isLoading">Guardar perfil</UButton>
            </div>
        </UForm>
    </div>
</template>
