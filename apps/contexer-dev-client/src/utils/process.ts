import {spawn} from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'

export function runInstallScript(scriptPath: string): Promise<void> {

    return new Promise<void>((resolve, reject) => {
        const installScriptPath = path.join('./', 'scripts', scriptPath)

        const env = {
            ...(typeof process !== 'undefined' ? process.env : {} as any),
            ELECTRON_RUN_AS_NODE: '1',
            all_proxy: (typeof process !== 'undefined' ? (process.env as any).all_proxy : undefined) || (typeof process !== 'undefined' ? process.env?.ALL_PROXY : undefined) || undefined,
            grpc_proxy: (typeof process !== 'undefined' ? (process.env as any).grpc_proxy : undefined) || (typeof process !== 'undefined' ? process.env?.GRPC_PROXY : undefined) || undefined,
            http_proxy: (typeof process !== 'undefined' ? (process.env as any).http_proxy : undefined) || (typeof process !== 'undefined' ? process.env?.HTTP_PROXY : undefined) || undefined,
            https_proxy: (typeof process !== 'undefined' ? (process.env as any).https_proxy : undefined) || (typeof process !== 'undefined' ? process.env?.HTTPS_PROXY : undefined) || undefined
        }

        const nodeProcess = spawn((typeof process !== 'undefined' ? process.execPath : 'node'), [installScriptPath], {env})

        nodeProcess.stdout.on('data', (data) => {
            console.info(`Script output: ${data}`)
        })

        nodeProcess.stderr.on('data', (data) => {
            console.error(`Script error: ${data}`)
        })

        nodeProcess.on('close', (code) => {
            if (code === 0) {
                console.info('Script completed successfully')
                resolve()
            } else {
                console.error(`Script exited with code ${code}`)
                reject(new Error(`Process exited with code ${code}`))
            }
        })
    })
}

export async function getBinaryPath(name: string): Promise<string> {
    let cmd = (typeof process !== 'undefined' ? process.platform : 'win32') === 'win32' ? `${name}.exe` : name
    const binariesDir = path.join(os.homedir(), '.contexer', 'bin')
    const binariesDirExists = await fs.existsSync(binariesDir)
    cmd = binariesDirExists ? path.join(binariesDir, cmd) : name
    return cmd
}

export async function isBinaryExists(name: string): Promise<boolean> {
    const cmd = await getBinaryPath(name)
    return await fs.existsSync(cmd)
}