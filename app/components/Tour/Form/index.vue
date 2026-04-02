<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Tour, TourFormInitialValues, TourFormState } from '~~/types/tour'
import {
  createEmptyTourFormState,
  mapInitialValuesToTourDraft,
  toTourFormInitialValues,
  TOUR_MAX_UPLOAD_SIZE_BYTES,
} from '~~/app/utils/tour-form'

const tourSchema = z.object({
	name: z.string().min(2, 'El nombre del tour es obligatorio').max(120),
	description: z.string().max(2000).optional().default(''),
	location: z.string().max(200).optional().default(''),
	date: z.string().min(1, 'La fecha del tour es obligatoria'),
	price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
	attendees: z.array(z.any()).default([]),
	sponsors: z.array(z.any()).default([]),
	packages: z
		.array(
			z.object({
				level: z.number().min(1),
				name: z.string().min(1, 'El nombre del paquete es obligatorio'),
				description: z.string().optional().default(''),
				price: z.number().min(0),
				benefits: z.array(z.string().min(1, 'El beneficio es obligatorio')).default([]),
			}),
		)
		.default([]),
	departure_points: z
		.array(
			z.object({
				name: z.string().min(1, 'El nombre del punto de salida es obligatorio'),
				location: z.string().optional().default(''),
				dateTime: z.string().min(1, 'La hora de salida es obligatoria'),
				notes: z.string().optional().default(''),
			}),
		)
		.default([]),
})

const props = defineProps<{
	tourId?: string
}>()

const emit = defineEmits<{
	saved: []
}>()

const { tour, isLoading, isSaving, errorMessage, successMessage, loadTour, saveTour, resetTourFormState } = useTour()

const draft = reactive<TourFormState>(createEmptyTourFormState())

const imageFile = ref<File | null>(null)
const imagePreviewUrl = ref<string | null>(null)
const localErrorMessage = ref<string | null>(null)

const isEditing = computed(() => Boolean(props.tourId))
const submitLabel = computed(() => isEditing.value ? 'Actualizar tour' : 'Crear tour')

const initialValues = computed<TourFormInitialValues>(() => toTourFormInitialValues(tour.value as Tour | undefined))

const currentImageUrl = computed(() => {
	const image = initialValues.value?.image
	return image ? `/blob/${image}` : ''
})

function clearImagePreview() {
	if (imagePreviewUrl.value) {
		URL.revokeObjectURL(imagePreviewUrl.value)
		imagePreviewUrl.value = null
	}
}

function resetDraft() {
	mapInitialValuesToTourDraft(draft, createEmptyTourFormState())
	imageFile.value = null
	clearImagePreview()
}

watch(
	initialValues,
	(values) => {
		mapInitialValuesToTourDraft(draft, values)
	},
	{ immediate: true, deep: true },
)

watch(imageFile, (file, previousFile) => {
	if (imagePreviewUrl.value && previousFile) {
		clearImagePreview()
	}

	if (!file) {
		localErrorMessage.value = null
		return
	}

	if (file.size > TOUR_MAX_UPLOAD_SIZE_BYTES) {
		localErrorMessage.value = 'La imagen del tour debe pesar menos de 10 MB.'
		imageFile.value = null
		return
	}

	localErrorMessage.value = null
	imagePreviewUrl.value = URL.createObjectURL(file)
})

onBeforeUnmount(() => {
	clearImagePreview()
})

async function onSubmit(event: FormSubmitEvent<TourFormState>) {
	const ok = await saveTour(
		event.data,
		{ imageFile: imageFile.value },
		{ id: props.tourId },
	)

	if (!ok) {
		return
	}

	if (isEditing.value) {
		imageFile.value = null
	} else {
		resetDraft()
		resetTourFormState()
	}

	emit('saved')
}

async function reloadForm() {
	if (!isEditing.value) {
		resetDraft()
		localErrorMessage.value = null
		return
	}

	await loadTour(props.tourId as string, { force: true })
}

onMounted(async () => {
	if (!isEditing.value) {
		resetTourFormState()
		resetDraft()
		return
	}

	await loadTour(props.tourId as string)
})
</script>

<template>
	<div class="w-full space-y-4">
		<UAlert
			v-if="errorMessage || localErrorMessage"
			color="error"
			icon="i-lucide-alert-circle"
			:title="errorMessage || localErrorMessage || ''"
		/>

		<UAlert
			v-if="successMessage"
			color="success"
			icon="i-lucide-check-circle"
			:title="successMessage"
		/>

		<UForm :schema="tourSchema" :state="draft" class="space-y-6" @submit="onSubmit">
			<div class="grid grid-cols-1 gap-4 xl:grid-cols-[1.05fr_1.4fr]">
				<TourFormImageField
					v-model="imageFile"
					:current-image-url="currentImageUrl"
					:image-preview-url="imagePreviewUrl"
				/>
				<TourFormBasics :draft="draft" />
			</div>

			<USeparator />

			<div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
				<TourFormPackages v-model="draft.packages" />
				<TourFormDeparturePoints v-model="draft.departure_points" />
			</div>

			<div class="flex flex-wrap items-center justify-end gap-3">
				<UButton type="button" color="neutral" variant="soft" :disabled="isSaving || isLoading" @click="reloadForm">
					Recargar
				</UButton>
				<UButton type="submit" :loading="isSaving">{{ submitLabel }}</UButton>
			</div>
		</UForm>
	</div>
</template>
