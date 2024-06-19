import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "./ui/button"
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { useEffect, useState } from "react"
import { Loader2, Minus, MinusCircle, Rabbit } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import idl from '../../idl.json'
import kp from '../../keypair.json'
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'
import {
    AnchorProvider,
    BN,
    Idl,
    Program, web3
} from '@project-serum/anchor'
import axios from "axios"
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey"
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes"

export default function Playground({ application }: any) {
    // Hook for showing success/error messages
    const { toast } = useToast()
    const [instructions, setInstructions] = useState<Array<any>>([])
    const [selectedInstruction, setSelectedInstruction] = useState<string | null>(null)
    const [fields, setFields] = useState<Array<any>>([])
    const [fieldInputs, setFieldInputs] = useState<Array<any>>([])
    const [programId, setProgramId] = useState<string>("")
    const [fetchedIDL, setFetchedIDL] = useState<Object>({})

    const changeFieldInputs = (i: number, newInput: HTMLInputElement["value"] | boolean, fType) => {
        let _inputs = [...fieldInputs]
        if (fType === "number") {
            _inputs[i] = new BN(newInput)
        }
        else {
            _inputs[i] = newInput
        }
        setFieldInputs(_inputs)
    }

    // Fetch app details 
    const fetchDetails = async () => {
        const res = await axios.post("/api/fetch", {
            app_name: application.name.toLowerCase().replace(/ /g, "_")
        })

        setProgramId(res.data.program_id)
        setFetchedIDL(JSON.parse(res.data.idl))
    }

    useEffect(() => {
        if (application) {
            const _instructions: Array<any> = []
            for (let i = 0; i < application.objects.length; i++) {
                const obj = application.objects[i]
                let v = obj.name.replace(/ /g, "_")

                // For each object, we will push a `create` instruction and a `get` instruction
                _instructions.push({
                    type: "create",
                    name: "init_" + v,
                    obj: obj.id
                })
                _instructions.push({
                    type: "get",
                    name: "get_" + v,
                    obj: obj.id
                })
            }
            setInstructions(_instructions);

            (async () => fetchDetails())()
        }
    }, [application])

    useEffect(() => {
        if (selectedInstruction) {
            // Get the arguments for that instruction, and save them in state
            const splitted = selectedInstruction.split(":")
            // The second item in the `splitted` array is the id of the object
            const obj = application.objects[parseInt(splitted[1])]

            // The fields must only be selected if the type of selected instruction is `create`
            if (splitted[0] === "create") {
                const _fields = []
                for (let i = 0; i < obj.fields.length; i++) {
                    const _field = obj.fields[i]
                    _fields.push(_field)
                }
                setFields(_fields)
            }
            else {
                setFields([])
            }
        }
    }, [selectedInstruction])

    const execute = async () => {
        if (selectedInstruction && programId !== "") {
            const programID = new PublicKey(programId)
            const { SystemProgram, Keypair } = web3;
            const arr = Object.values(kp._keypair.secretKey)
            const secret = new Uint8Array(arr)
            const baseAccount = web3.Keypair.fromSecretKey(secret)
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

            const provider = getProvider();
            const program = new Program((fetchedIDL as Idl), programID, provider)

            const splitted = selectedInstruction.split(":")
            const obj = application.objects[parseInt(splitted[1])]
            // Execute a create instruction
            if (splitted[0] === "create") {
                const method = `init${obj.name.toLowerCase().split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`
                const tempObj = {}
                // Relevant input is basically the first input which has a string type
                let relevantInput = ""
                for (let i = 0; i < obj.fields.length; i++) {
                    const ff = obj.fields[i];
                    if (ff.fieldType === "string") {
                        relevantInput = fieldInputs[i]
                    }
                }

                // Generate PDA for the Account
                const [PDA] = findProgramAddressSync([utf8.encode(obj.name.replace(/ /g, "_")), provider.wallet.publicKey.toBuffer(), utf8.encode(relevantInput)], program.programId)
                tempObj[`_${obj.name.replace(/ /g, "_")}`] = PDA
                console.log(...fieldInputs)
                // // Execute the function
                const tx = await program.methods[method](
                    ...fieldInputs
                ).accounts({
                    creator: provider.wallet.publicKey,
                    ...tempObj
                }).rpc()
                console.log(tx)

                // await program.rpc[method](...fieldInputs, {
                //     accounts: {
                //         creator: provider.wallet.publicKey,
                //         ...tempObj
                //     },
                // })
            }
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="ml-4">
                    Playground
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[460px]">
                <DialogHeader>
                    <DialogTitle>Playground</DialogTitle>
                    <DialogDescription>
                        This is where you can interact with your deployed application on the blockchain.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="instruction" className="text-right">
                            Instruction
                        </Label>
                        <Select onValueChange={e => setSelectedInstruction(e)}>
                            <SelectTrigger
                                id="instruction"
                                className="mt-2 col-span-3 items-start [&_[data-description]]:hidden"
                            >
                                <SelectValue placeholder="Choose an instruction" />
                            </SelectTrigger>
                            <SelectContent>
                                {instructions.map((instruction: any) => (
                                    <SelectItem value={`${instruction.type}:${instruction.obj.toString()}`}>
                                        <div className="flex items-start gap-3 text-muted-foreground">
                                            <div className="grid gap-0.5">
                                                <p>{instruction.name}</p>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {fields.map((f, i: number) => (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor={`field-${f.id}`} className="text-right">
                                {f.name}
                            </Label>
                            {f.fieldType === "string" || f.fieldType === "address" ?
                                <Input onChange={e => changeFieldInputs(i, e.target.value, f.fieldType)} className="col-span-3" id={`field-${f.id}`} placeholder={`Enter ${f.name}`} />
                                : (
                                    f.fieldType === "boolean" ? <Checkbox onCheckedChange={check => changeFieldInputs(i, check, f.fieldType)} /> :
                                        <Input type="number" onChange={e => changeFieldInputs(i, e.target.value, f.fieldType)} className="col-span-3" id={`field-${f.id}`} placeholder={`Enter ${f.name}`} />
                                )
                            }
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    <Button onClick={() => execute()} type="submit">
                        Execute
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}