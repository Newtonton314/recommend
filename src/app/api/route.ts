import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
    return NextResponse.json({message: "Hello"}, { status: 200 });
}

export async function GET() {
    return NextResponse.json({message: "Hello"}, { status: 200 });
}

