<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { OrganizerProfileFormState, Profile } from '~~/types/profile'

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024

const organizerProfileSchema = z.object({
    bio: z.string().max(500, 'Bio is too long').optional().default(''),
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

const picturePreviewUrl = ref<string | null>(null)
const bannerPreviewUrl = ref<string | null>(null)

function mapProfileToDraft(profileData: Profile | undefined) {
    draft.bio = profileData?.bio ?? ''
    draft.instagram = profileData?.social?.instagram ?? ''
    draft.x = profileData?.social?.x ?? ''
    draft.tiktok = profileData?.social?.tiktok ?? ''
}

watch(pictureFile, (file, previousFile) => {
    if (picturePreviewUrl.value && previousFile) {
        URL.revokeObjectURL(picturePreviewUrl.value)
        picturePreviewUrl.value = null
    }

    if (file) {
        picturePreviewUrl.value = URL.createObjectURL(file)
    }
})

watch(bannerFile, (file, previousFile) => {
    if (bannerPreviewUrl.value && previousFile) {
        URL.revokeObjectURL(bannerPreviewUrl.value)
        bannerPreviewUrl.value = null
    }

    if (file) {
        bannerPreviewUrl.value = URL.createObjectURL(file)
    }
})

onBeforeUnmount(() => {
    if (picturePreviewUrl.value) {
        URL.revokeObjectURL(picturePreviewUrl.value)
    }

    if (bannerPreviewUrl.value) {
        URL.revokeObjectURL(bannerPreviewUrl.value)
    }
})

function onPictureChange(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0] ?? null

    if (!file) {
        pictureFile.value = null
        return
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        errorMessage.value = 'Profile picture must be less than 10MB (it will be compressed automatically).'
        pictureFile.value = null
        target.value = ''
        return
    }

    pictureFile.value = file
}

function onBannerChange(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0] ?? null

    if (!file) {
        bannerFile.value = null
        return
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        errorMessage.value = 'Banner image must be less than 10MB (it will be compressed automatically).'
        bannerFile.value = null
        target.value = ''
        return
    }

    bannerFile.value = file
}

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
        <div class="space-y-1">
            <h2 class="text-xl font-semibold">Organizer Profile</h2>
            <p class="text-sm text-gray-600">Update your public organizer profile details.</p>
        </div>

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
            <UFormField name="bio" label="Bio">
                <UTextarea v-model="draft.bio" :rows="4" placeholder="Tell people about your work..." />
            </UFormField>

            <UFormField name="picture" label="Profile Picture (max 10MB)">
                <UInput type="file" accept="image/*" @change="onPictureChange" />
                <div class="mt-2">
                    <img
                        v-if="picturePreviewUrl"
                        :src="picturePreviewUrl"
                        alt="New profile picture preview"
                        class="h-24 w-24 rounded-full border object-cover"
                    >
                    <img
                        v-else-if="profile?.picture"
                        :src="`/blob/${profile.picture}`"
                        alt="Current profile picture"
                        class="h-24 w-24 rounded-full border object-cover"
                    >
                </div>
            </UFormField>

            <UFormField name="banner" label="Banner (max 10MB)">
                <UInput type="file" accept="image/*" @change="onBannerChange" />
                <div class="mt-2">
                    <img
                        v-if="bannerPreviewUrl"
                        :src="bannerPreviewUrl"
                        alt="New banner preview"
                        class="h-24 w-full rounded-md border object-cover"
                    >
                    <img
                        v-else-if="profile?.banner"
                        :src="`/blob/${profile.banner}`"
                        alt="Current banner"
                        class="h-24 w-full rounded-md border object-cover"
                    >
                </div>
            </UFormField>

            <UFormField name="instagram" label="Instagram">
                <UInput v-model="draft.instagram" placeholder="@yourhandle" />
            </UFormField>

            <UFormField name="x" label="X">
                <UInput v-model="draft.x" placeholder="@yourhandle" />
            </UFormField>

            <UFormField name="tiktok" label="TikTok">
                <UInput v-model="draft.tiktok" placeholder="@yourhandle" />
            </UFormField>

            <div class="flex gap-3">
                <UButton type="submit" :loading="isSaving" :disabled="isLoading">Save Profile</UButton>
                <UButton type="button" color="neutral" variant="soft" :disabled="isSaving" @click="() => syncDraft()">
                    Reload
                </UButton>
            </div>
        </UForm>
    </div>
</template>