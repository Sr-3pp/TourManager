export type ProfileSocial = {
	instagram: string
	tiktok: string
	x: string
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