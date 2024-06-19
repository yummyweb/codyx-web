import { exec, spawnSync } from 'child_process'
import { type NextRequest } from 'next/server'
import util from "util"
import fs from "fs"
import path from 'path';

const _exec = util.promisify(exec);

export const dynamic = 'force-dynamic' // defaults to auto
export async function POST(request: NextRequest) {
    const res = await request.json()

    // Add compiled code to the program file
    const filepath = `dump/${res.app_name}/programs_py/${res.app_name}.py`

    fs.writeFileSync(filepath, res.code, 'utf-8')

    return Response.json({
        success: true,
        err: null
    })
}