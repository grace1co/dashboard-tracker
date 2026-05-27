// app/api/books/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const search = searchParams.get("search");

  try {
    const where: any = {};
    if (status) where.status = status;
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { author: { contains: search, mode: "insensitive" } },
      ];
    }

    const books = await prisma.book.findMany({
      where,
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    });
    return NextResponse.json(books);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const now = new Date();
    const book = await prisma.book.create({
      data: {
        title: body.title,
        author: body.author,
        status: body.status || "WANT_TO_READ",
        rating: body.rating ? parseInt(body.rating) : null,
        genre: body.genre,
        pageCount: body.pageCount ? parseInt(body.pageCount) : null,
        currentPage: body.currentPage ? parseInt(body.currentPage) : null,
        notes: body.notes,
        startedAt: body.status === "READING" ? now : null,
        finishedAt: body.status === "COMPLETED" ? now : null,
        month: body.status === "COMPLETED" ? now.getMonth() + 1 : null,
        year: now.getFullYear(),
      },
    });
    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add book" }, { status: 500 });
  }
}
