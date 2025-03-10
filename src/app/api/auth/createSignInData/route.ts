import { createSolanaMessage } from '@/lib/generic'
import { SolanaSignInInput } from '@solana/wallet-standard-features'
import { type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic' // defaults to auto
export async function GET(request: NextRequest) {
    const signInData: SolanaSignInInput = {
        domain: "localhost:3000",
        statement: "Sign in with Solana to the app.",
        version: "1",
        chainId: "devnet",
        issuedAt: new Date().toISOString()
    }

    return Response.json({
        signInData
    })
}