import { NextResponse } from 'next/server'
import axios from 'axios';


export async function POST() {

    console.log("Session endpoint called");
    try {
        console.log("APIKEY:", process.env.OPENAI_APIKEY);
        const response = await axios.post(
            'https://api.openai.com/v1/realtime/sessions',
            {
                model: 'gpt-4o-realtime-preview',
                voice: 'coral'
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_APIKEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log("test");
        return NextResponse.json(response.data, { status: 200 });
    } catch (err: any) {
        console.error('Session endpoint error:', err);
        if (err.response) {
            return NextResponse.json({error: err.response.data}, { status: err.response.status, });
        } else {
            return NextResponse.json({error: 'セッション発行に失敗しました。'}, { status: 500, });
        }
    }
}
