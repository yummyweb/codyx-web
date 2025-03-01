import { exec, spawnSync } from 'child_process'
import { type NextRequest } from 'next/server'
import util from "util"
import fs from "fs"
import path from 'path';

const _exec = util.promisify(exec);

export const dynamic = 'force-dynamic' // defaults to auto
export async function POST(request: NextRequest) {
    const res = await request.json()

    try {
        const { stdout: _stdout, stderr: _stderr } = await _exec(`cd dump/${res.app_name} && anchor keys list`)
        const programId = _stdout.substring(res.app_name.length + 2).slice(0, -1)
    }
    catch (error) {
        return Response.json({
            success: true,
            err: null,
            program_id: null,
            idl: null
        })
    }

    // Read IDL file
    try {
        const filepath = `dump/${res.app_name}/target/idl/${res.app_name}.json`
        const idl = fs.readFileSync(filepath, { encoding: "utf-8" })

        return Response.json({
            success: true,
            err: null,
            program_id: programId,
            idl
        })
    }
    catch (error) {
        return Response.json({
            success: true,
            err: null,
            program_id: programId,
            idl: null
        })
    }
}