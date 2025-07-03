// types/product.ts
export interface Brand {
	id: string
	name: string
	slug: string
	description?: string
	logo_url?: string
	brand_color?: string
	website_url?: string
	is_active: boolean
}

export interface Category {
	id: string
	name: string
	slug: string
	description?: string
	parent_id?: string
	display_order: number
	is_active: boolean
}

export interface MaterialType {
	id: string
	name: string
	slug: string
	description?: string
	properties: Record<string, any>
	is_active: boolean
}

export interface Color {
	id: string
	palette_id: string
	name: string
	code: string
	hex_value: string
	rgb_r: number
	rgb_g: number
	rgb_b: number
	hsl_h?: number
	hsl_s?: number
	hsl_l?: number
	color_family: string
	is_popular: boolean
	popularity_score: number
}

export interface ProductColor {
	id: string
	product_id: string
	color_id: string
	variant_sku?: string
	stock_quantity: number
	is_available: boolean
	swatch_image_url?: string
	color: Color
}

export interface RoomMapping {
	id: string
	room_category_id: string
	product_id: string
	suitability_score: number
	is_recommended: boolean
	recommendation_reason?: string
	usage_notes?: string
	room_category: {
		id: string
		name: string
		slug: string
	}
}

export interface ProductTag {
	id: string
	name: string
	slug: string
	category: string
	description?: string
	display_color?: string
	is_filterable: boolean
}

export interface Product {
	id: string
	sku: string
	name: string
	slug: string
	description?: string
	short_description?: string

	// IDs
	brand_id: string
	collection_id?: string
	category_id: string
	material_type_id: string

	// Product specs
	base_color?: string
	color_family?: string
	finish_type?: string
	coverage_area?: number
	dry_time_minutes?: number

	// Application details
	application_methods?: string[]
	surface_types?: string[]
	indoor_use: boolean
	outdoor_use: boolean

	// Technical properties
	voc_content?: number
	temperature_min?: number
	temperature_max?: number
	humidity_max?: number

	// Availability
	volume_ml?: number
	stock_quantity: number
	is_available: boolean

	// SEO
	meta_title?: string
	meta_description?: string
	keywords?: string[]

	// Images
	primary_image_url?: string
	primary_image_storage_path?: string
	image_urls?: string[]
	swatch_image_url?: string
	swatch_storage_path?: string

	// Status
	is_active: boolean
	is_featured: boolean
	created_at: string
	updated_at: string

	// Relations (populated by joins)
	brand?: Brand
	category?: Category
	collection?: {
		id: string
		name: string
		slug: string
	}
	material_type?: MaterialType
	colors?: ProductColor[]
	room_mappings?: RoomMapping[]
	tags?: Array<{
		tag: ProductTag
	}>
}
