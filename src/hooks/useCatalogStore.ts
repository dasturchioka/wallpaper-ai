import { create } from 'zustand'

type Filter = {
	brand: string | null
	category: string | null
	colorFamily: string | null
	finishType: string | null
	search: string
}

type CatalogStore = {
	products: any[]
	brands: any[]
	categories: any[]
	filters: Filter
	loading: boolean
	setProducts: (products: any[]) => void
	setBrands: (brands: any[]) => void
	setCategories: (categories: any[]) => void
	updateFilters: (newFilters: Partial<Filter>) => void
	clearFilters: () => void
}

const defaultFilters: Filter = {
	brand: null,
	category: null,
	colorFamily: null,
	finishType: null,
	search: '',
}

export const useCatalogStore = create<CatalogStore>((set, get) => ({
	products: [],
	brands: [],
	categories: [],
	filters: { ...defaultFilters },
	loading: false,
	setProducts: products => set({ products }),
	setBrands: brands => set({ brands }),
	setCategories: categories => set({ categories }),
	updateFilters: newFilters =>
		set(state => ({
			filters: { ...state.filters, ...newFilters },
		})),
	clearFilters: () => set({ filters: { ...defaultFilters } }),
}))
