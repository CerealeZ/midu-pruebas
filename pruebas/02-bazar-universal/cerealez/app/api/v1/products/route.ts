import { NextResponse } from "next/server"

import products, {
  Orders,
  SortableValue,
  Product,
  VALID_SORTABLE_ORDERS,
  VALID_SORTABLE_VALUES,
} from "@/sources/usecases/products"
import _ from "underscore"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const queries = Object.fromEntries(searchParams.entries())
  const [page = 1, size = 10] = [queries.page, queries.size].map(
    convertToNumbers
  )
  const [sort, order] = parseOrderQuery(queries.sort)
  const whereValues = pickFilterValues(queries)

  //
  const [
    maxRating,
    minRating,
    maxPrice,
    minPrice,
    maxDiscount,
    minDiscount,
    maxStock,
    minStock,
  ] = [
    queries["max-rating"],
    queries["min-rating"],

    queries["max-price"],
    queries["min-price"],

    queries["max-discount"],
    queries["min-discount"],

    queries["max-stock"],
    queries["min-stock"],
  ].map(convertToNumbers)

  const name = queries.q
  return NextResponse.json(
    products.getProducts(
      name,
      whereValues,
      { page, size, order, sort },
      {
        discountPercentage: {
          min: minDiscount,
          max: maxDiscount,
        },

        price: {
          max: maxPrice,
          min: minPrice,
        },

        stock: {
          max: maxStock,
          min: minStock,
        },

        rating: {
          max: maxRating,
          min: minRating,
        },
      }
    )
  )
}

/** Convert to number, otherwise returns undefined */
const convertToNumbers = <T>(value: T) => {
  const parsedValue = Number(value)
  return Number.isNaN(parsedValue) ? undefined : parsedValue
}

/** parse order query, otherwise returns undefined */

const parseOrderQuery = (
  query = ""
): [SortableValue | undefined, Orders | undefined] => {
  const [sort, order] = query.toLocaleLowerCase().split(",")
  const sortType = VALID_SORTABLE_VALUES.find((value) => value === sort)
  const orderType = VALID_SORTABLE_ORDERS.find((value) => value === order)
  return [sortType, orderType]
}

const pickFilterValues = <T extends Record<string, any>>(
  object: T
): Partial<Product> => {
  return _.pick(object, ...VALID_SORTABLE_VALUES)
}

// const removeNullishValues = (where: Partial<Product>) => {
//   const result = _.omit(where, (value) => {
//     return value === undefined
//   })
//   return removeNullishValues
// }
