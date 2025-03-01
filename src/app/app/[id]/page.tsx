"use client"
import Navbar from "@/components/navbar";
import idl from '../../../../idl.json'
import kp from '../../../../keypair.json'
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'
import {
    AnchorProvider,
    Idl,
    Program, web3
} from '@project-serum/anchor'
import { useCallback, useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input"
import { CornerDownLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "@heroicons/react/24/outline"
import { Badge } from "@/components/ui/badge"
import CreateObject from "@/components/create-object"
import ReactFlow, { applyNodeChanges, Background, Controls } from 'reactflow'
import 'reactflow/dist/style.css';
import CreateFunction from "@/components/create-function";
import { compileFromJson } from "@/lib/seahorse_helper";
import axios from "axios";
import { ToastAction } from "@/components/ui/toast";
import Playground from "@/components/playground";

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

export default function Page({ params }: { params: { id: string } }) {
    //TODO: Use `Application` type, instead of any
    const [application, setApplication] = useState<any | null>(null)
    const [selectedObject, setSelectedObject] = useState<any | null>(null)
    const [objNode, setObjNode] = useState<any | null>(null)
    const [edges, setEdges] = useState<Array<any>>([])
    const [programid, setProgramid] = useState<string>("")

    const { toast } = useToast()

    const getApplication = async () => {
        try {
            const provider = getProvider();
            const program = new Program((idl as Idl), programID, provider);
            const account = await program.account.application.fetch(baseAccount.publicKey);

            console.log("Got the account", account)
            setApplication(account.applicationList[parseInt(params.id as string)])
            console.log(account.applicationList[parseInt(params.id as string)])
        } catch (error) {
            console.log("Error: ", error)
        }
    }

    useEffect(() => {
        if (params.id) {
            (async () => await getApplication())()
            toast({
                description: `App deployed successfully.`,
                action: <ToastAction onClick={() => window ? window.open("https://explorer.solana.com/address/DDt7M6vz1sLdUdU3QCGdr1Fn69YaS9jZCXvWkcTVHm9?cluster=devnet", '_blank')?.focus() : null} altText="Open">Open</ToastAction> 
            })
        }
    }, [params])

    //TODO: Change `any` type to `Object` type
    const selectObject = (obj: any) => {
        setSelectedObject(obj)
        setObjNode(new Array({
            id: '0',
            position: {
                x: 50,
                y: 200
            },
            data: {
                label: obj.name
            }
        }))

        // Get all function nodes and render them on the editor
        console.log(application.functions)
        for (let i = 0; i < application.functions.length; i++) {
            const fnction = application.functions[i]
            //TODO: Change type `any` to something else
            setObjNode((prev: any) => [...prev, {
                id: (i + 1).toString(),
                position: {
                    x: 300,
                    y: 200
                },
                data: {
                    label: fnction.name
                },
                style: {
                    backgroundColor: "#0f0c0c",
                    color: "white"
                }
            }])

            // Create edges between the object node and function nodes
            setEdges((prev: any) => [...prev, {
                id: (edges.length + 1).toString(),
                source: "0", // The source is the object node which always has id 0
                target: (i + 1).toString()
            }])
        }
    }

    const onNodesChange = useCallback(
        (changes: any) => setObjNode((nds: any) => applyNodeChanges(changes, nds)),
        [],
    );

    const compileCode = async () => {
        const code = compileFromJson(application)
        const res = await axios.post("/api/compile", {
            app_name: application.name.toLowerCase().replace(/ /g, "_"),
            code
        })
        console.log(res.data)

        if (res.data.success) {
            // Show success message to user
            toast({
                description: "App compiled successfully.",
            })
        }
    }

    const deploy = async () => {
        const res = await axios.post("/api/deploy", {
            app_name: application.name.toLowerCase().replace(/ /g, "_")
        })
        console.log(res.data)

        if (res.data.success && res.data.program_id) {
            setProgramid(res.data.program_id)
            // Show success message to user
            toast({
                description: `App deployed successfully.`,
                action: <ToastAction onClick={() => window ? window.open("https://explorer.solana.com/address/" + res.data.program_id + "?cluster=devnet", '_blank')?.focus() : null} altText="Open">Open</ToastAction>
            })
        }
    }

    return (
        <>
            <Navbar />
            {application ? <main className="grid flex-1 gap-4 overflow-auto py-8 px-10 md:grid-cols-2 lg:grid-cols-3">
                {/* CONFIG PANEL (LEFT SIDE) */}
                <div
                    className="relative hidden flex-col items-start gap-8 md:flex" x-chunk="dashboard-03-chunk-0"
                >
                    <form className="grid w-full items-start gap-6">
                        <fieldset className="grid gap-6 rounded-lg border p-4">
                            <legend className="-ml-1 px-1 text-sm font-medium">
                                Settings
                            </legend>
                            <div className="grid gap-3">
                                <Label htmlFor="id">ID</Label>
                                <Input disabled id="id" type="text" value={application.id} />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="name">Name</Label>
                                <Input disabled id="name" type="text" value={application.name} />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="creator">Creator</Label>
                                <Input disabled id="creator" type="text" value={application.creator} />
                            </div>
                        </fieldset>
                        <fieldset className="grid gap-6 rounded-lg border p-4">
                            <legend className="-ml-1 px-1 text-sm font-medium">
                                Objects
                            </legend>
                            <CreateObject appId={params.id} />
                            {/* RENDER A LIST OF `OBJECTS` ITERATIVELY */}
                            {application.objects.map((obj: any) => (
                                <div onClick={() => selectObject(obj)} className="text-center py-2 w-[40%] hover:bg-border border border-gray-800 rounded-md cursor-pointer">{obj.name}</div>
                            ))}
                        </fieldset>
                    </form>
                </div>
                {/* EDITOR PANEL (RIGHT SIDE) */}
                <div className="relative flex h-full min-h-[60vh] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
                    <ReactFlow onNodesChange={onNodesChange} edges={edges ? edges : []} nodes={selectedObject ? objNode : []} ref={(el) => el && el.style.setProperty("height", "80%", "important")}>
                        <div className="absolute z-10 flex justify-between w-full items-center">
                            <div>
                                {selectedObject ?
                                    (<CreateFunction appId={params.id} objId={selectedObject.id} />) : null}
                                <Button onClick={() => compileCode()} className="ml-4">
                                    Compile Code
                                </Button>
                                <Button onClick={() => deploy()} className="ml-4">
                                    Deploy
                                </Button>
                                <Playground program_id={programid} application={application} />
                            </div>
                            <Badge variant="outline">
                                Editor
                            </Badge>
                        </div>
                        <Background />
                    </ReactFlow>
                    <form
                        className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring" x-chunk="dashboard-03-chunk-1"
                    >
                        <Label htmlFor="message" className="sr-only">
                            Message
                        </Label>
                        <Textarea
                            id="message"
                            placeholder="Describe your app in a couple of sentences..."
                            className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
                        />
                        <div className="flex items-center p-3 pt-0">
                            <Button onClick={e => e.preventDefault()} size="sm" className="ml-auto gap-1.5">
                                Generate with AI
                                <CornerDownLeft className="size-3.5" />
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
                : (
                    <div className="w-full mt-10 flex justify-center items-center">
                        <Loader2 className="mr-3 h-10 w-10 animate-spin" />
                        <h1 className="text-2xl">Loading...</h1>
                    </div>
                )}
        </>
    )
}