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

const draft = reactive<TourFormState>({
	name: '',
	description: '',
	location: '',
	date: '',
	price: 0,
	attendees: [],
	sponsors: [],
	packages: [],
	departure_points: [],
})

const imageFile = ref<File | null>(null)
const imagePreviewUrl = ref<string | null>(null)
const localErrorMessage = ref<string | null>(null)

function cloneSocial(social?: { instagram?: string, x?: string, tiktok?: string } | null) {
	return {
		instagram: social?.instagram ?? '',
		x: social?.x ?? '',
		tiktok: social?.tiktok ?? '',
	}
}

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

const initialValues = computed<TourFormInitialValues>(() => {
	const value = tour.value as Tour | undefined

	return {
		name: value?.name,
		description: value?.description,
		location: value?.location,
		date: value?.date ? new Date(value.date).toISOString().slice(0, 16) : '',
		price: value?.price ?? 0,
		attendees: value?.attendees ?? [],
		sponsors: value?.sponsors ?? [],
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
	draft.price = values?.price ?? 0
	draft.attendees = (values?.attendees ?? []).map(attendee => ({
		name: attendee.name ?? '',
		email: attendee.email ?? '',
		social: cloneSocial(attendee.social),
	}))
	draft.sponsors = (values?.sponsors ?? []).map(sponsor => ({
		packageLevel: sponsor.packageLevel ?? '',
		name: sponsor.name ?? '',
		logo: sponsor.logo ?? null,
		website: sponsor.website ?? '',
		social: cloneSocial(sponsor.social),
	}))
	draft.packages = normalizePackageDrafts((values?.packages ?? []).map(pkg => ({
		level: Number(pkg.level) || 1,
		name: pkg.name ?? '',
		description: pkg.description ?? '',
		price: Number(pkg.price) || 0,
		benefits: [...(pkg.benefits ?? [])],
	})))
	draft.departure_points = (values?.departure_points ?? []).map(point => ({
		name: point.name ?? '',
		location: point.location ?? '',
		dateTime: point.dateTime ?? '',
		notes: point.notes ?? '',
	}))
}

function resetDraft() {
	mapInitialValues({
		name: '',
		description: '',
		location: '',
		date: '',
		price: 0,
		attendees: [],
		sponsors: [],
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

		<UForm :schema="tourSchema" :state="draft" class="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4" @submit="onSubmit">
			<UFormField name="name" label="Nombre del tour" class="col-span-2 md:col-span-1">
				<UInput class="w-full" v-model="draft.name" placeholder="Aventura increíble por los Andes" />
			</UFormField>

			<UFormField name="location" label="Ubicación" class="col-span-2 md:col-span-1">
				<UInput class="w-full" v-model="draft.location" placeholder="Cusco, Peru" />
			</UFormField>

			<UFormField name="description" label="Descripción" class="col-span-2">
				<UTextarea class="w-full" v-model="draft.description" :rows="4" placeholder="Describe la experiencia..." />
			</UFormField>

			<UFormField name="date" label="Fecha del tour" class="col-span-2 md:col-span-1">
				<UInput class="w-full" v-model="draft.date" type="datetime-local" />
			</UFormField>

			<UFormField name="price" label="Precio del tour" class="col-span-2 md:col-span-1">
				<UInput class="w-full" v-model.number="draft.price" type="number" min="0" step="0.01" placeholder="Precio" />
			</UFormField>

			<UFormField name="image" label="Imagen del tour (máx. 10 MB)" class="col-span-2">
				<UInput class="w-full" type="file" accept="image/*" @change="onImageChange" />
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


			<UCard class="col-span-2">
				<div class="flex items-center justify-between">
					<h3 class="text-sm font-semibold">Paquetes</h3>
					<UButton type="button" size="sm" variant="soft" @click="addPackage">Agregar paquete</UButton>
				</div>

				<UPageList as="ul" divide class="mt-4">
					<li v-for="(pkg, packageIndex) in draft.packages" :key="`package-${packageIndex}`" class="list-none py-4 first:pt-0 last:pb-0">
						<div class="space-y-3">
							<div class="flex justify-between gap-3">
								<p class="text-sm font-medium text-muted">Paquete {{ packageIndex + 1 }}</p>
								<UButton type="button" size="xs" color="error" variant="ghost" @click="removePackage(packageIndex)">Eliminar</UButton>
							</div>
							<div class="grid gap-2 md:grid-cols-2">
								<UFormField name="Nombre del paquete" label="Nombre del paquete">
									<UInput v-model="pkg.name" placeholder="Bronce" />
								</UFormField>
								<UFormField name="Precio del paquete" label="Precio del paquete">
									<UInput v-model.number="pkg.price" type="number" min="0" step="0.01" placeholder="Precio" />
								</UFormField>
								<UFormField name="Descripción del paquete" label="Descripción del paquete" class="col-span-2">
									<UTextarea class="w-full" v-model="pkg.description" :rows="2" placeholder="Descripción del paquete" />
								</UFormField>
							</div>

							<div class="space-y-2">
								<div class="flex items-center justify-between">
									<p class="text-xs font-medium">Beneficios</p>
									<UButton type="button" size="xs" variant="soft" @click="addBenefit(packageIndex)">Agregar beneficio</UButton>
								</div>
								<div v-for="(benefit, benefitIndex) in pkg.benefits" :key="`benefit-${packageIndex}-${benefitIndex}`" class="flex gap-2">
									<UFormField :name="`Beneficio ${benefitIndex + 1}`" :label="`Beneficio ${benefitIndex + 1}`" class="flex-1">
										<UInput v-model="pkg.benefits[benefitIndex]" placeholder="Beneficio" />
									</UFormField>
									<UButton type="button" size="xs" color="error" variant="ghost" @click="removeBenefit(packageIndex, benefitIndex)">Eliminar</UButton>
								</div>
							</div>
						</div>
					</li>
				</UPageList>
			</UCard>

			<UCard class="col-span-2">
				<div class="flex items-center justify-between">
					<h3 class="text-sm font-semibold">Puntos de salida</h3>
					<UButton type="button" size="sm" variant="soft" @click="addDeparturePoint">Agregar salida</UButton>
				</div>

				<UPageList as="ul" divide class="mt-4">
					<li v-for="(point, pointIndex) in draft.departure_points" :key="`departure-${pointIndex}`" class="list-none py-4 first:pt-0 last:pb-0">
						<div class="space-y-3">
							<div class="flex justify-between gap-3">
								<p class="text-sm font-medium text-muted">Salida {{ pointIndex + 1 }}</p>
								<UButton type="button" size="xs" color="error" variant="ghost" @click="removeDeparturePoint(pointIndex)">Eliminar</UButton>
							</div>
							<div class="grid gap-2 md:grid-cols-2">
								<UFormField name="Nombre del punto de salida" label="Nombre del punto de salida">
									<UInput v-model="point.name" placeholder="Nombre de la salida" />
								</UFormField>	
								<UFormField name="Ubicación del punto de salida" label="Ubicación del punto de salida">
									<UInput v-model="point.location" placeholder="Ubicación de la salida" />
								</UFormField>
							</div>
							<UFormField name="Fecha y hora del punto de salida" label="Fecha y hora del punto de salida">
								<UInput class="w-full" v-model="point.dateTime" type="datetime-local" />
							</UFormField>
							<UFormField name="Notas del punto de salida" label="Notas del punto de salida">
								<UTextarea class="w-full" v-model="point.notes" :rows="2" placeholder="Notas" />
							</UFormField>
						</div>
					</li>
				</UPageList>
			</UCard>

			<div class="flex gap-3">
				<UButton type="submit" :loading="isSaving">{{ props.tourId ? 'Actualizar tour' : 'Crear tour' }}</UButton>
				<UButton type="button" color="neutral" variant="soft" :disabled="isSaving || isLoading" @click="reloadForm">
					Recargar
				</UButton>
			</div>
		</UForm>
	</div>
</template>
