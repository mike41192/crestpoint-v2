import { NextResponse } from "next/server"
import PDFParser from "pdf2json"

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function parsePdfBuffer(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser()

    pdfParser.on("pdfParser_dataError", (errData: any) => {
      reject(new Error(errData.parserError || "PDF parsing failed."))
    })

    pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
      try {
        const pages = pdfData?.Pages || pdfData?.pages || []

        const text = pages
          .map((page: any) => {
            const textItems = page.Texts || page.texts || []

            return textItems
              .map((textItem: any) => {
                const runs = textItem.R || textItem.runs || []

                return runs
                  .map((run: any) => safeDecode(run.T || run.text || ""))
                  .join("")
              })
              .join(" ")
          })
          .join("\n\n")
          .replace(/\s+/g, " ")
          .trim()

        if (!text) {
          reject(
            new Error(
              "No selectable text found. This PDF may be scanned/image-based. Try exporting it as DOCX or copy/paste the resume text."
            )
          )
          return
        }

        resolve(text)
      } catch {
        reject(new Error("Could not extract text from PDF."))
      }
    })

    pdfParser.parseBuffer(buffer)
  })
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { error: "No PDF uploaded." },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const text = await parsePdfBuffer(buffer)

    return NextResponse.json({ text })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "PDF parsing failed." },
      { status: 500 }
    )
  }
}