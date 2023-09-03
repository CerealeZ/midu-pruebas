import { NextResponse } from "next/server"
import products from "@/sources/usecases/products"

export async function GET(_: Request, params: { params: { id: string } }) {
  const foundDictionary = products.getDictionary(params.params.id)
  const response = foundDictionary ?? {
    msg: "Dictionary not found",
  }
  return NextResponse.json(response, {
    status: foundDictionary ? 200 : 404,
  })
}
