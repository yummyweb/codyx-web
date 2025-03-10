import { type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic' // defaults to auto
export async function POST(request: NextRequest) {
    const res = await request.json()
    
    

    return Response.json({
        success: true,
        err: null
    })
}