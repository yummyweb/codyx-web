import { exec, spawnSync } from 'child_process'
import { type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic' // defaults to auto
export async function POST(request: NextRequest) {
    const res = await request.json()

    exec('cd dump && seahorse init ' + res.app_name, (err, stdout, stderr) => {
        console.log(stdout)

        if (err) {
            return Response.json({
                success: false,
                err
            })
        }
        else {
            return Response.json({
                success: true,
                err: null
            })
        }
    })

    return Response.json({
        success: true
    })
}

export async function DELETE(request: NextRequest) {
    const res = await request.json()

    console.log(res.app_name)
    exec('cd dump && rm -rf ' + res.app_name, (err, stdout, stderr) => {
        if (err) {
            return Response.json({
                success: false,
                err
            })
        }
        else {
            return Response.json({
                success: true,
                err: null
            })
        }
    })

    return Response.json({
        success: true
    })
}