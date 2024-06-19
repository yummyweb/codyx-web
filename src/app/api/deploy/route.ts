import { exec, spawnSync } from 'child_process'
import { type NextRequest } from 'next/server'
import util from "util"
import fs from "fs"
import path from 'path';

const _exec = util.promisify(exec);

export const dynamic = 'force-dynamic' // defaults to auto
export async function POST(request: NextRequest) {
    const res = await request.json()

    // Compile and build the necessary target
    try {
        const { stdout, stderr } = await _exec(`cd dump/${res.app_name} && seahorse build`)
        console.log(stdout)

        if (stderr !== '') {
            return Response.json({
                success: false,
                err: stderr
            })
        }

        // Execute `anchor keys list` to fetch the program id
        const { stdout: _stdout, stderr: _stderr } = await _exec(`cd dump/${res.app_name} && anchor keys list`)
        const programId = _stdout.substring(res.app_name.length + 2).slice(0, -1)

        // Replace the dummy program id with the fetched one
        const filepath = `dump/${res.app_name}/programs_py/${res.app_name}.py`
        const code = fs.readFileSync(filepath, { encoding: "utf-8" })
        const edited = code.replace("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS", programId)

        fs.writeFileSync(filepath, edited, 'utf-8')

        // Run build again
        const { stdout: __stdout, stderr: __stderr } = await _exec(`cd dump/${res.app_name} && seahorse build`)
        console.log(__stdout)

        if (__stderr !== '') {
            return Response.json({
                success: false,
                err: __stderr
            })
        }

        // Change `Localnet` to `devnet` in Anchor.toml under provider
        const _filepath = `dump/${res.app_name}/Anchor.toml`
        const config = fs.readFileSync(_filepath, { encoding: "utf-8" })
        const editedConfig = config.replace("Localnet", "devnet")

        fs.writeFileSync(_filepath, editedConfig, 'utf-8')

        // Finally, deploy using `anchor deploy`
        const { stdout: ___stdout, stderr: ___stderr } = await _exec(`cd dump/${res.app_name} && anchor deploy`)
        console.log(___stdout)

        if (___stderr !== '') {
            return Response.json({
                success: false,
                err: ___stderr
            })
        }

        return Response.json({
            success: true,
            err: null,
            program_id: programId
        })
    }
    catch (error: any) {
        console.log(error)

        // Check for exit code 1, since it indicates a warning from `anchor build`
        if (error.code === 1) {
            // Execute `anchor keys list` to fetch the program id
            const { stdout, stderr } = await _exec(`cd dump/${res.app_name} && anchor keys list`)
            const programId = stdout.substring(res.app_name.length + 2).slice(0, -1)

            // Replace the dummy program id with the fetched one
            const filepath = `dump/${res.app_name}/programs_py/${res.app_name}.py`
            const code = fs.readFileSync(filepath, { encoding: "utf-8" })
            const edited = code.replace("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS", programId)

            fs.writeFileSync(filepath, edited, 'utf-8')

            // Run build again
            const { stdout: _stdout, stderr: _stderr } = await _exec(`cd dump/${res.app_name} && seahorse build`)
            console.log(_stdout)

            if (_stderr !== '') {
                return Response.json({
                    success: false,
                    err: _stderr
                })
            }

            // Change `Localnet` to `devnet` in Anchor.toml under provider
            const _filepath = `dump/${res.app_name}/Anchor.toml`
            const config = fs.readFileSync(_filepath, { encoding: "utf-8" })
            const editedConfig = config.replace("Localnet", "devnet")

            fs.writeFileSync(_filepath, editedConfig, 'utf-8')

            // Finally, deploy using `anchor deploy`
            const { stdout: __stdout, stderr: __stderr } = await _exec(`cd dump/${res.app_name} && anchor deploy`)
            console.log(__stdout)

            if (__stderr !== '') {
                return Response.json({
                    success: false,
                    err: __stderr
                })
            }

            return Response.json({
                success: true,
                err: null,
                program_id: programId
            })
        }
    }

    return Response.json({
        success: true,
        err: null,
        program_id: null
    })
}