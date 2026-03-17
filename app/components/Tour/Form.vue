<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Tour, TourFormInitialValues, TourFormState } from '~~/types/tour'

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024

const tourSchema = z.object({
	name: z.string().min(2, 'El nombre del tour es obligatorio').max(120),
	description: z.string().max(2000).optional().default(''),
	location: z.string().max(200).optional().default(''),
	date: z.string().min(1, 'La fecha del tour es obligatoria'),
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
		localErrorMessage.value = 'La imagen del tour debe pesar menos de 10 MB.'
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
			<h2 class="text-xl font-semibold">{{ props.tourId ? 'Editar tour' : 'Crear tour' }}</h2>
			<p class="text-sm text-gray-600">Crea o actualiza los detalles de tu tour.</p>
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
			<UFormField name="name" label="Nombre del tour">
				<UInput v-model="draft.name" placeholder="Aventura increíble por los Andes" />
			</UFormField>

			<UFormField name="description" label="Descripción">
				<UTextarea v-model="draft.description" :rows="4" placeholder="Describe la experiencia..." />
			</UFormField>

			<UFormField name="location" label="Ubicación">
				<UInput v-model="draft.location" placeholder="Cusco, Peru" />
			</UFormField>

			<UFormField name="date" label="Fecha del tour">
				<UInput v-model="draft.date" type="datetime-local" />
			</UFormField>

			<UFormField name="image" label="Imagen del tour (máx. 10 MB)">
				<UInput type="file" accept="image/*" @change="onImageChange" />
				<div class="mt-2">
					<img
						v-if="imagePreviewUrl"
						:src="imagePreviewUrl"
						alt="Vista previa de la nueva imagen del tour"
						class="h-24 w-full rounded-md border object-cover"
					>
					<img
						v-else-if="currentImageUrl"
						:src="currentImageUrl"
						alt="Imagen actual del tour"
						class="h-24 w-full rounded-md border object-cover"
					>
				</div>
			</UFormField>


			<div class="space-y-3 rounded-md border p-4">
				<div class="flex items-center justify-between">
					<h3 class="text-sm font-semibold">Paquetes</h3>
					<UButton type="button" size="sm" variant="soft" @click="addPackage">Agregar paquete</UButton>
				</div>

				<div v-for="(pkg, packageIndex) in draft.packages" :key="`package-${packageIndex}`" class="space-y-3 rounded-md border p-3">
					<div class="flex justify-end">
						<UButton type="button" size="xs" color="error" variant="ghost" @click="removePackage(packageIndex)">Eliminar</UButton>
					</div>
					<div class="grid gap-2 md:grid-cols-3">
						<UInput v-model.number="pkg.level" type="number" min="1" placeholder="Nivel" />
						<UInput v-model="pkg.name" placeholder="Nombre del paquete" />
						<UInput v-model.number="pkg.price" type="number" min="0" step="0.01" placeholder="Precio" />
					</div>
					<UTextarea v-model="pkg.description" :rows="2" placeholder="Descripción del paquete" />

					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<p class="text-xs font-medium">Beneficios</p>
							<UButton type="button" size="xs" variant="soft" @click="addBenefit(packageIndex)">Agregar beneficio</UButton>
						</div>
						<div v-for="(benefit, benefitIndex) in pkg.benefits" :key="`benefit-${packageIndex}-${benefitIndex}`" class="flex gap-2">
							<UInput v-model="pkg.benefits[benefitIndex]" placeholder="Beneficio" class="flex-1" />
							<UButton type="button" size="xs" color="error" variant="ghost" @click="removeBenefit(packageIndex, benefitIndex)">Eliminar</UButton>
						</div>
					</div>
				</div>
			</div>

			<div class="space-y-3 rounded-md border p-4">
				<div class="flex items-center justify-between">
					<h3 class="text-sm font-semibold">Puntos de salida</h3>
					<UButton type="button" size="sm" variant="soft" @click="addDeparturePoint">Agregar salida</UButton>
				</div>

				<div v-for="(point, pointIndex) in draft.departure_points" :key="`departure-${pointIndex}`" class="space-y-3 rounded-md border p-3">
					<div class="flex justify-end">
						<UButton type="button" size="xs" color="error" variant="ghost" @click="removeDeparturePoint(pointIndex)">Eliminar</UButton>
					</div>
					<div class="grid gap-2 md:grid-cols-2">
						<UInput v-model="point.name" placeholder="Nombre de la salida" />
						<UInput v-model="point.location" placeholder="Ubicación de la salida" />
					</div>
					<UInput v-model="point.dateTime" type="datetime-local" />
					<UTextarea v-model="point.notes" :rows="2" placeholder="Notas" />
				</div>
			</div>

			<div class="flex gap-3">
				<UButton type="submit" :loading="isSaving">{{ props.tourId ? 'Actualizar tour' : 'Crear tour' }}</UButton>
				<UButton type="button" color="neutral" variant="soft" :disabled="isSaving || isLoading" @click="reloadForm">
					Recargar
				</UButton>
			</div>
		</UForm>
	</div>
</template>
