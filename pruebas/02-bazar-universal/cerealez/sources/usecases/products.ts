import productsJson from "sources/data/products.json"
import categoriesJson from "sources/data/categories.json"
import brandsJson from "sources/data/brands.json"
import sortArray from "sort-array"
import _ from "underscore"

export type Orders = "asc" | "desc"

export interface Product {
  id: number
  title: string
  description: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  brand: string
  category: string
  thumbnail: string
  images: string[]
}

export type SortableValue = keyof Omit<Product, "images" | "title">
export type NumericValues = keyof Pick<
  Product,
  "price" | "rating" | "stock" | "discountPercentage"
>

export const VALID_SORTABLE_VALUES: SortableValue[] = [
  "brand",
  "category",
  "description",
  "discountPercentage",
  "id",
  "price",
  "rating",
  "stock",
  "thumbnail",
]

const NUMERIC_VALUES: NumericValues[] = [
  "discountPercentage",
  "price",
  "stock",
  "rating",
]

type Ranges = Record<NumericValues, { min?: number; max?: number }>

export const VALID_SORTABLE_ORDERS: Orders[] = ["asc", "desc"]

const ProductsUseCases = (utils: {
  sort: (array: Product[], sort?: SortableValue, order?: Orders) => Product[]
}) => {
  const products: Product[] = productsJson.products

  const dictionaries = [
    {
      id: "brands",
      value: brandsJson.data,
    },
    {
      id: "categories",
      value: categoriesJson.data,
    },
  ]

  const findProductById = (searchedId: number) => {
    return products.find(({ id }) => searchedId === id)
  }

  const getProducts = (
    name?: string,
    where?: Partial<Product>,
    options?: {
      page?: number
      size?: number
      sort?: SortableValue
      order?: Orders
    },
    ranges?: Partial<Ranges>
  ) => {
    let searchedProducts = [...products]

    if (name) {
      const NO_CASE_SENSITIVE = "i"
      const regex = new RegExp(name, NO_CASE_SENSITIVE)
      searchedProducts = searchedProducts.filter(({ title }) =>
        regex.test(title)
      )
    }

    if (ranges) {
      type TestType = [NumericValues, { min: number; max: number }]
      const arrayRanges = Object.entries(ranges) as TestType[]

      searchedProducts = searchedProducts.filter((product) => {
        const isInRange = arrayRanges.every(([key, { min, max }]) => {
          const checkRange = checkBetween(min, max)
          return checkRange(product[key])
        })
        return isInRange
      })
    }

    if (where) {
      searchedProducts = _.where(searchedProducts, where)
    }

    if (options?.order || options?.sort) {
      searchedProducts = utils.sort(
        searchedProducts,
        options.sort,
        options.order
      )
    }

    const size = options?.size ?? 10
    const page = options?.page ?? 1
    const totalPages = Math.ceil(searchedProducts.length / size)
    const start = (page - 1) * size
    const end = start + size
    const pagedResponse = searchedProducts.slice(start, end)

    return {
      totalPages,
      data: pagedResponse,
      itemsPerPage: size,
      page,
      totalItems: searchedProducts.length,
    }
  }

  const getDictionary = (id: string) => {
    return dictionaries.find((dictionary) => dictionary.id === id)?.value
  }

  return {
    products,
    findProductById,
    getProducts,
    getDictionary,
  }
}

export default ProductsUseCases({
  sort: (products, sort, order) => {
    const sortedArray = sortArray(products, {
      by: sort,
      order: order,
    })
    return sortedArray
  },
})

const checkBetween =
  (min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) =>
  (value: number) => {
    return value >= min && value <= max
  }
