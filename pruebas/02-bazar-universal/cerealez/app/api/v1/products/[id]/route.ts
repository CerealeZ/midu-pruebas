import { NextResponse } from "next/server"
import products from "@/sources/usecases/products"

export async function GET(_: Request, params: { params: { id: string } }) {
  const id = Number(params.params.id)
  if (Number.isNaN(id)) {
    return NextResponse.json(
      {
        msg: "Wrong Id format",
      },
      {
        status: 400,
      }
    )
  }
  const foundProduct = products.findProductById(id)
  const response = foundProduct ?? {
    msg: "Product not found",
  }
  return NextResponse.json(response, {
    status: foundProduct ? 200 : 404,
  })
}
