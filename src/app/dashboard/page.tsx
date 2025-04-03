"use client"
import Navbar from "@/components/navbar"
import { checkIfUserConnected } from "../../lib/generic"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { EllipsisHorizontalCircleIcon, EllipsisHorizontalIcon, PlusIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import idl from '../../../idl.json'
import kp from '../../../keypair.json'
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'
import {
    AnchorProvider,
    Idl,
    Program, web3
} from '@project-serum/anchor'
import axios from "axios"

// Configuration for web3 connection
const { SystemProgram, Keypair } = web3;
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)
const programID = new PublicKey(idl.metadata.address);
const network = clusterApiUrl('devnet');
const opts: { preflightCommitment: web3.ConfirmOptions } = {
    preflightCommitment: "processed"
}

const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(
        connection, window.solana, opts.preflightCommitment,
    );
    return provider;
}

export default function Dashboard() {
    const [userApplications, setUserApplications] = useState<Array<any> | null>(null)
    const [walletAddress, setWalletAddress] = useState<string | null>(null)
    const [applicationName, setApplicationName] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)

    // Hook for showing success/error messages
    const { toast } = useToast()

    const router = useRouter()

    useEffect(() => {
        checkIfUserConnected(setWalletAddress)
    }, [])

    useEffect(() => {
        const do_something = async () => {
            if (walletAddress) {
                await getApplications()
            }
        }
        do_something()
    }, [walletAddress])

    const createAccount = async () => {
        try {
            const provider = getProvider();
            const program = new Program((idl as Idl), programID, provider);
            console.log("ping")
            await program.rpc.initialize({
                accounts: {
                    baseApplication: baseAccount.publicKey,
                    user: provider.wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                },
                signers: [baseAccount]
            });
            console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
            await getApplications()
        } catch (error) {
            console.log("Error creating BaseAccount account:", error)
        }
    }

    // Getting a list of applications
    const getApplications = async () => {
        try {
            const sessionId = document.cookie.split(`; session-id=`)[1]

            const res = await fetch("/api/applications", {
                method: "POST",
                body: JSON.stringify({ sessionId })
            })

            const resp = await res.json()

            setUserApplications(resp.applications)
        } catch (error) {
            console.log("Error: ", error)
            createAccount()
            setUserApplications(null);
        }
    }

    // Creating a new application
    const newApplication = async () => {
        setLoading(true)

        try {
            const provider = getProvider();
            const program = new Program((idl as Idl), programID, provider);

            // Execute instruction
            const currTimestamp = Date.now().toString()
            await program.rpc.newApplication(applicationName, currTimestamp, {
                accounts: {
                    baseApplication: baseAccount.publicKey,
                    user: provider.wallet.publicKey,
                },
            });

            // Send request to API to create a new project locally
            const res = await axios.post("/api/project", {
                app_name: applicationName.toLowerCase().replace(/ /g, "_")
            })
            console.log(res.data)

            if (res.data.success) {
                setLoading(false)
            }

            // Redirect the user to the application page
            const account = await program.account.application.fetch(baseAccount.publicKey)
            const newId = account.applicationList.length - 1
            router.push(`/app/${newId}`)
        }
        catch (e) {
            console.log(e)
            console.log("error")
            setLoading(false)
        }
    }

    // Deleting an application
    const deleteApplication = async (id: any, applicationName: string) => {
        try {
            const provider = getProvider();
            const program = new Program((idl as Idl), programID, provider);

            // Execute instruction
            await program.rpc.deleteApplication(id, {
                accounts: {
                    baseApplication: baseAccount.publicKey,
                    user: provider.wallet.publicKey,
                },
            });

            // Send request to API to create a new project locally
            const res = await axios.delete("/api/project", {
                data: {
                    app_name: applicationName.toLowerCase().replace(/ /g, "_")
                }
            })
            console.log(res.data)

            if (res.data.success) {
                // Show success message to user
                toast({
                    description: "Successfully deleted application.",
                })
            }
        }
        catch (e) {
            console.log(e)
            console.log("error")
        }
    }

    return (
        <>
            <Navbar />
            <main>
                <div className='relative px-6 lg:px-8'>
                    <div className='mx-auto max-w-7xl py-8'>
                        <div className="flex items-center justify-between py-4">
                            <Input
                                placeholder="Filter apps..."
                                className="max-w-sm"
                            />
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button>
                                        <PlusIcon /> Create Application
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Create an application</DialogTitle>
                                        <DialogDescription>
                                            Name your application here. Click create when you're done.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="name" className="text-right">
                                                Name
                                            </Label>
                                            <Input
                                                id="name"
                                                value={applicationName}
                                                onChange={e => setApplicationName(e.target.value)}
                                                className="col-span-3"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={() => newApplication()} disabled={loading} type="submit">
                                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            Create
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <Table>
                            <TableCaption>A list of your created applications.</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">ID</TableHead>
                                    <TableHead className="hidden md:table-cell">Name</TableHead>
                                    <TableHead className="hidden md:table-cell">Creator</TableHead>
                                    <TableHead className="hidden md:table-cell">Timestamp</TableHead>
                                    <TableHead>
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {userApplications ? userApplications.map((app: any) => (
                                    <TableRow>
                                        <TableCell onClick={() => router.push(`/app/${app.id}`)} className="cursor-pointer font-medium">{app.id}</TableCell>
                                        <TableCell onClick={() => router.push(`/app/${app.id}`)} className="cursor-pointer underline hidden md:table-cell">{app.name}</TableCell>
                                        <TableCell onClick={() => router.push(`/app/${app.id}`)} className="cursor-pointer hidden md:table-cell">{app.creator.toString().slice(0, 5)}...{app.creator.toString().slice(33)}</TableCell>
                                        <TableCell onClick={() => router.push(`/app/${app.id}`)} className="cursor-pointer hidden md:table-cell">{new Date(Number(app.timestamp)).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        aria-haspopup="true"
                                                        size="icon"
                                                        variant="ghost"
                                                    >
                                                        <EllipsisHorizontalIcon className="h-4 w-4" />
                                                        <span className="sr-only">Toggle menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => deleteApplication(app.id, app.name)} className="focus:bg-red-500">Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : null}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </main >
        </>
    )
}