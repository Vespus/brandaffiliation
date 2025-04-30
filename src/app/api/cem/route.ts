import {NextResponse} from "next/server";

export const GET = () => {
    return NextResponse.json({
        oai: process.env.OPENAI_API_KEY,
        claude: process.env.ANTHROPIC_API_KEY,
        env: process.env.NODE_ENV
    })
}