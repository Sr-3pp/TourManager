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

function getNextPackageLevel() {
	const levels = draft.packages
		.map(pkg => Number(pkg.level))
		.filter(level => Number.isFinite(level) && level >= 1)

	return levels.length ? Math.max(...levels) + 1 : 1
}

function normalizePackageDrafts(packages: TourFormState['packages'] = []) {
	const usedLevels = new Set<number>()

	return packages.map((pkg) => {
		const parsedLevel = Number(pkg.level)
		const hasValidLevel =
			Number.isInteger(parsedLevel)
			&& parsedLevel >= 1
			&& !usedLevels.has(parsedLevel)

		const level = hasValidLevel
			? parsedLevel
			: (() => {
				let nextLevel = 1

				while (usedLevels.has(nextLevel)) {
					nextLevel += 1
				}

				return nextLevel
			})()

		usedLevels.add(level)

		return {
			...pkg,
			level,
		}
	})
}

function addPackage() {
	draft.packages.push({
		level: getNextPackageLevel(),
		name: '',
		description: '',
		price: 0,
		benefits: [],
	})
}

function removePackage(index: number) {
	draft.packages.splice(index, 1)
}

function addBenefit(packageIndex: number) {
	draft.packages[packageIndex]?.benefits.push('')
}

function removeBenefit(packageIndex: number, benefitIndex: number) {
	draft.packages[packageIndex]?.benefits.splice(benefitIndex, 1)
}

function addDeparturePoint() {
	draft.departure_points.push({
		name: '',
		location: '',
		dateTime: '',
		notes: '',
	})
}

function removeDeparturePoint(index: number) {
	draft.departure_points.splice(index, 1)
}

const initialValues = computed<TourFormInitialValues>(() => toTourFormInitialValues(tour.value as Tour | undefined))

const currentImageUrl = computed(() => {
	const image = initialValues.value?.image
	return image ? `/blob/${image}` : ''
})

function resetDraft() {
	mapInitialValuesToTourDraft(draft, createEmptyTourFormState())
	imageFile.value = null
	if (imagePreviewUrl.value) {
		URL.revokeObjectURL(imagePreviewUrl.value)
		imagePreviewUrl.value = null
	}
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
		URL.revokeObjectURL(imagePreviewUrl.value)
		imagePreviewUrl.value = null
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

	if (file) {
		imagePreviewUrl.value = URL.createObjectURL(file)
	}
})

onBeforeUnmount(() => {
	if (imagePreviewUrl.value) {
		URL.revokeObjectURL(imagePreviewUrl.value)
	}
})

function onSubmit(event: FormSubmitEvent<TourFormState>) {
	saveTour(
		event.data,
		{ imageFile: imageFile.value },
		{ id: props.tourId },
	).then((ok) => {
		if (ok) {
			if (props.tourId) {
				imageFile.value = null
			} else {
				resetDraft()
				resetTourFormState()
			}

			emit('saved')
		}
	})
}

async function reloadForm() {
	if (!props.tourId) {
		mapInitialValuesToTourDraft(draft, createEmptyTourFormState())
		imageFile.value = null
		return
	}

	await loadTour(props.tourId, { force: true })
}

onMounted(async () => {
	if (!props.tourId) {
		resetTourFormState()
		resetDraft()
		return
	}

	await loadTour(props.tourId)
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

		<UForm :schema="tourSchema" :state="draft" class="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4" @submit="onSubmit">
			<fieldset class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<TourFormImageField
					v-model="imageFile"
					:current-image-url="currentImageUrl"
					:image-preview-url="imagePreviewUrl"
				/>
	
				<TourFormBasics :draft="draft" />
			</fieldset>

			<fieldset class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<TourFormPackages
					:packages="draft.packages"
					@add-package="addPackage"
					@remove-package="removePackage"
					@add-benefit="addBenefit"
					@remove-benefit="removeBenefit"
				/>
	
				<TourFormDeparturePoints
					:departure-points="draft.departure_points"
					@add-departure-point="addDeparturePoint"
					@remove-departure-point="removeDeparturePoint"
				/>
			</fieldset>


			<div class="flex gap-3">
				<UButton type="submit" :loading="isSaving">{{ props.tourId ? 'Actualizar tour' : 'Crear tour' }}</UButton>
				<UButton type="button" color="neutral" variant="soft" :disabled="isSaving || isLoading" @click="reloadForm">
					Recargar
				</UButton>
			</div>
		</UForm>
	</div>
</template>
