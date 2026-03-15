export type ProfileSocial = {
	instagram: string
	tiktok: string
	x: string
}

export type OrganizerUser = {
	name?: string
	slug?: string
	profile?: Profile
}

export type Profile = {
	banner: string | null
	bio: string
	picture: string | null
	social: ProfileSocial
	user: string
}

export type OrganizerProfileFormState = {
	bio: string
	instagram: string
	tiktok: string
	x: string
}

export type MeResponse = {
	user?: {
		profile?: Profile
	}
}

export type OrganizerResponse = {
	user: OrganizerUser
	tours: import('~~/types/tour').Tour[]
}

export type ProfileUpdateBody = {
	banner?: string | null
	bio?: string
	picture?: string | null
	social?: Partial<ProfileSocial>
}
