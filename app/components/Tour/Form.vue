<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Tour, TourFormInitialValues, TourFormState } from '~~/types/tour'

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024

const tourSchema = z.object({
	name: z.string().min(2, 'Tour name is required').max(120),
	description: z.string().max(2000).optional().default(''),
	location: z.string().max(200).optional().default(''),
	date: z.string().min(1, 'Tour date is required'),
	packages: z
		.array(
			z.object({
				level: z.number().min(1),
				name: z.string().min(1, 'Package name is required'),
				description: z.string().optional().default(''),
				price: z.number().min(0),
				benefits: z.array(z.string().min(1, 'Benefit is required')).default([]),
			}),
		)
		.default([]),
	departure_points: z
		.array(
			z.object({
				name: z.string().min(1, 'Departure point name is required'),
				location: z.string().optional().default(''),
				dateTime: z.string().min(1, 'Departure time is required'),
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

const draft = reactive<TourFormState>({
	name: '',
	description: '',
	location: '',
	date: '',
	packages: [],
	departure_points: [],
})

const imageFile = ref<File | null>(null)
const imagePreviewUrl = ref<string | null>(null)
const localErrorMessage = ref<string | null>(null)

function addPackage() {
	draft.packages.push({
		level: 1,
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

const initialValues = computed<TourFormInitialValues>(() => {
	const value = tour.value as Tour | undefined

	return {
		name: value?.name,
		description: value?.description,
		location: value?.location,
		date: value?.date ? new Date(value.date).toISOString().slice(0, 16) : '',
		image: value?.image ?? null,
		packages: value?.packages ?? [],
		departure_points:
			value?.departure_points?.map((point) => ({
				...point,
				dateTime: point?.dateTime ? new Date(point.dateTime).toISOString().slice(0, 16) : '',
			})) ?? [],
	}
})

const currentImageUrl = computed(() => {
	const image = initialValues.value?.image
	return image ? `/blob/${image}` : ''
})

function mapInitialValues(values?: TourFormInitialValues) {
	draft.name = values?.name ?? ''
	draft.description = values?.description ?? ''
	draft.location = values?.location ?? ''
	draft.date = values?.date ?? ''
	draft.packages = values?.packages ? structuredClone(values.packages) : []
	draft.departure_points = values?.departure_points ? structuredClone(values.departure_points) : []
}

function resetDraft() {
	mapInitialValues({
		name: '',
		description: '',
		location: '',
		date: '',
		packages: [],
		departure_points: [],
		image: null,
	})
	imageFile.value = null
	if (imagePreviewUrl.value) {
		URL.revokeObjectURL(imagePreviewUrl.value)
		imagePreviewUrl.value = null
	}
}

watch(
	initialValues,
	(values) => {
		mapInitialValues(values)
	},
	{ immediate: true, deep: true },
)

watch(imageFile, (file, previousFile) => {
	if (imagePreviewUrl.value && previousFile) {
		URL.revokeObjectURL(imagePreviewUrl.value)
		imagePreviewUrl.value = null
	}

	if (file) {
		imagePreviewUrl.value = URL.createObjectURL(file)
	}
})

onBeforeUnmount(() => {
	if (imagePreviewUrl.value) {
		URL.revokeObjectURL(imagePreviewUrl.value)
	}
})

function onImageChange(event: Event) {
	localErrorMessage.value = null
	const target = event.target as HTMLInputElement
	const file = target.files?.[0] ?? null

	if (!file) {
		imageFile.value = null
		return
	}

	if (file.size > MAX_UPLOAD_SIZE_BYTES) {
		localErrorMessage.value = 'Tour image must be less than 10MB.'
		imageFile.value = null
		target.value = ''
		return
	}

	imageFile.value = file
}

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
		mapInitialValues({})
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
	<div class="max-w-2xl space-y-4">
		<div class="space-y-1">
			<h2 class="text-xl font-semibold">{{ props.tourId ? 'Edit Tour' : 'Create Tour' }}</h2>
			<p class="text-sm text-gray-600">Create or update your tour details.</p>
		</div>

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

		<UForm :schema="tourSchema" :state="draft" class="space-y-4" @submit="onSubmit">
			<UFormField name="name" label="Tour Name">
				<UInput v-model="draft.name" placeholder="Amazing Andes Adventure" />
			</UFormField>

			<UFormField name="description" label="Description">
				<UTextarea v-model="draft.description" :rows="4" placeholder="Describe the experience..." />
			</UFormField>

			<UFormField name="location" label="Location">
				<UInput v-model="draft.location" placeholder="Cusco, Peru" />
			</UFormField>

			<UFormField name="date" label="Tour Date">
				<UInput v-model="draft.date" type="datetime-local" />
			</UFormField>

			<UFormField name="image" label="Tour Image (max 10MB)">
				<UInput type="file" accept="image/*" @change="onImageChange" />
				<div class="mt-2">
					<img
						v-if="imagePreviewUrl"
						:src="imagePreviewUrl"
						alt="New tour image preview"
						class="h-24 w-full rounded-md border object-cover"
					>
					<img
						v-else-if="currentImageUrl"
						:src="currentImageUrl"
						alt="Current tour image"
						class="h-24 w-full rounded-md border object-cover"
					>
				</div>
			</UFormField>


			<div class="space-y-3 rounded-md border p-4">
				<div class="flex items-center justify-between">
					<h3 class="text-sm font-semibold">Packages</h3>
					<UButton type="button" size="sm" variant="soft" @click="addPackage">Add Package</UButton>
				</div>

				<div v-for="(pkg, packageIndex) in draft.packages" :key="`package-${packageIndex}`" class="space-y-3 rounded-md border p-3">
					<div class="flex justify-end">
						<UButton type="button" size="xs" color="error" variant="ghost" @click="removePackage(packageIndex)">Remove</UButton>
					</div>
					<div class="grid gap-2 md:grid-cols-3">
						<UInput v-model.number="pkg.level" type="number" min="1" placeholder="Level" />
						<UInput v-model="pkg.name" placeholder="Package name" />
						<UInput v-model.number="pkg.price" type="number" min="0" step="0.01" placeholder="Price" />
					</div>
					<UTextarea v-model="pkg.description" :rows="2" placeholder="Package description" />

					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<p class="text-xs font-medium">Benefits</p>
							<UButton type="button" size="xs" variant="soft" @click="addBenefit(packageIndex)">Add Benefit</UButton>
						</div>
						<div v-for="(benefit, benefitIndex) in pkg.benefits" :key="`benefit-${packageIndex}-${benefitIndex}`" class="flex gap-2">
							<UInput v-model="pkg.benefits[benefitIndex]" placeholder="Benefit" class="flex-1" />
							<UButton type="button" size="xs" color="error" variant="ghost" @click="removeBenefit(packageIndex, benefitIndex)">Remove</UButton>
						</div>
					</div>
				</div>
			</div>

			<div class="space-y-3 rounded-md border p-4">
				<div class="flex items-center justify-between">
					<h3 class="text-sm font-semibold">Departure Points</h3>
					<UButton type="button" size="sm" variant="soft" @click="addDeparturePoint">Add Departure</UButton>
				</div>

				<div v-for="(point, pointIndex) in draft.departure_points" :key="`departure-${pointIndex}`" class="space-y-3 rounded-md border p-3">
					<div class="flex justify-end">
						<UButton type="button" size="xs" color="error" variant="ghost" @click="removeDeparturePoint(pointIndex)">Remove</UButton>
					</div>
					<div class="grid gap-2 md:grid-cols-2">
						<UInput v-model="point.name" placeholder="Departure name" />
						<UInput v-model="point.location" placeholder="Departure location" />
					</div>
					<UInput v-model="point.dateTime" type="datetime-local" />
					<UTextarea v-model="point.notes" :rows="2" placeholder="Notes" />
				</div>
			</div>

			<div class="flex gap-3">
				<UButton type="submit" :loading="isSaving">{{ props.tourId ? 'Update Tour' : 'Create Tour' }}</UButton>
				<UButton type="button" color="neutral" variant="soft" :disabled="isSaving || isLoading" @click="reloadForm">
					Reload
				</UButton>
			</div>
		</UForm>
	</div>
</template>
