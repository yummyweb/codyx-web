import { createSolanaMessage, getSIWS } from '@/lib/generic'
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes'
import { type NextRequest } from 'next/server'
import type {
    SolanaSignInInput,
    SolanaSignInOutput,
} from "@solana/wallet-standard-features";
import { verifySignIn } from "@solana/wallet-standard-util";
import { cookies } from 'next/headers'

import { PrismaClient } from '../../../../../prisma/app/generated/prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic' // defaults to auto
export async function POST(request: NextRequest) {
    const res = await request.json()
    const cookieStore = await cookies()

    const serialisedOutput: SolanaSignInOutput = {
        account: {
            publicKey: new Uint8Array(Object.keys(res.publicKey).map(function (key) { return res.publicKey[key]; })),
            ...res.output.account
        },
        signature: new Uint8Array(res.output.signature.data),
        signedMessage: new Uint8Array(res.output.signedMessage.data),
    };

    const decodedPK = bs58.encode(Object.keys(res.publicKey).map(function (key) { return res.publicKey[key]; }))

    // Check if user exists, else save in database
    const existingUser = await prisma.user.findUnique({
        where: {
            address: decodedPK,
        },
    })

    if (existingUser) {
        const updateUser = await prisma.user.update({
            where: {
                address: decodedPK,
            },
            data: {
                signature: bs58.encode(new Uint8Array(res.output.signature.data)),
            },
        })
    }

    if (!existingUser) {
        const newUser = await prisma.user.create({
            data: {
                address: decodedPK,
                signature: bs58.encode(new Uint8Array(res.output.signature.data)),
                chainId: "devnet"
            },
        })
    }

    // Store a server-side cookie as `session-id` to persist user session and check for authorization
    cookieStore.set("session-id", bs58.encode(new Uint8Array(res.output.signature.data)))

    return Response.json({
        success: verifySignIn(res.input, serialisedOutput)
    })
}