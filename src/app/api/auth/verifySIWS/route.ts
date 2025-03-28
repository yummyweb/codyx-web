import { createSolanaMessage, getSIWS } from '@/lib/generic'
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes'
import { type NextRequest } from 'next/server'
import type {
    SolanaSignInInput,
    SolanaSignInOutput,
} from "@solana/wallet-standard-features";
import { verifySignIn } from "@solana/wallet-standard-util";

export const dynamic = 'force-dynamic' // defaults to auto
export async function POST(request: NextRequest) {
    const res = await request.json()

    // console.log(res.signedMessage)

    // const message = getSIWS(res.publicKey)
    // const success = message.verify({
    //     signature: {
    //         t: "sip99",
    //         s: res.signedMessage
    //     },
    //     payload: message.payload
    // })

    console.log(res.publicKey)
    const serialisedOutput: SolanaSignInOutput = {
        account: {
            publicKey: new Uint8Array(res.output.account["#e"]),
            ...res.output.account
        },
        signature: new Uint8Array(res.output.signature.data),
        signedMessage: new Uint8Array(res.output.signedMessage.data),
    };

    return Response.json({
        success: verifySignIn(res.input, serialisedOutput)
    })
}