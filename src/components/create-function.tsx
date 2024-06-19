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
import { useState } from "react"
import { BadgePlus, BookCheck, Loader2, Minus, MinusCircle, Rabbit } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import idl from '../../idl.json'
import kp from '../../keypair.json'
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'
import {
    AnchorProvider,
    Idl,
    Program, web3
} from '@project-serum/anchor'

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

export default function CreateFunction({ appId, objId }: any) {
    const [loading, setLoading] = useState<boolean>(false)
    const [functionName, setFunctionName] = useState<string>("")
    const [action, setAction] = useState<string>("")
    const [parameters, setParameters] = useState<Array<any>>([])
    //TODO: Use `Params` type, instead of any
    const [targetParams, setTargetParams] = useState<Array<any>>([])

    // Hook for showing success/error messages
    const { toast } = useToast()

    // Parameter "arithmetic"
    const addParameter = () => {
        setParameters(parameters.concat([{
            name: "",
            type: ""
        }]))
    }

    const updateParameterName = (i: number, name: HTMLInputElement["value"]) => {
        let _parameters = [...parameters]
        let parameter = { ..._parameters[i] }
        parameter.name = name
        _parameters[i] = parameter
        setParameters(_parameters)
    }

    const updateParameterType = (i: number, typeOfField: HTMLInputElement["value"]) => {
        let _parameters = [...parameters]
        let parameter = { ..._parameters[i] }
        parameter.type = typeOfField
        _parameters[i] = parameter
        setParameters(_parameters)
    }

    const removeParameter = (i: number) => {
        setParameters(parameters.filter((item, idx) => idx !== i))
    }

    // Creating function
    const createFunction = async (id: number, name: string, action: string, target: number, params: Array<any>) => {
        try {
            const provider = getProvider();
            const program = new Program((idl as Idl), programID, provider);

            let paramNames: string[] = []
            let paramTypes: string[] = []
            for (let i = 0; i < params.length; i++) {
                paramNames.push(params[i].name)
                paramTypes.push(params[i].type)
            }

            if (params.length === 0) {
                paramNames.push("null")
                paramTypes.push("null")
            }

            await program.rpc.addFunctionToApplication(id, name, action, target, paramNames, paramTypes, {
                accounts: {
                    baseApplication: baseAccount.publicKey,
                    user: provider.wallet.publicKey,
                },
            })

            toast({
                description: "Successfully created function and added to application.",
            })
        }
        catch (e) {
            console.log(e)
            console.log("error")
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    Add Function
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[460px]">
                <DialogHeader>
                    <DialogTitle>Create a new function</DialogTitle>
                    <DialogDescription>
                        Think of a function as any way to "do" something in your app. Maybe fetch some data or mutate a variable.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            className="col-span-3"
                            value={functionName}
                            onChange={e => setFunctionName(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="action" className="text-right">
                            Action
                        </Label>
                        <Select>
                            <SelectTrigger
                                id={"action"}
                                className="mt-2 col-span-3 items-start [&_[data-description]]:hidden"
                            >
                                <SelectValue placeholder="Select an action" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="read">
                                    <div className="flex items-start gap-3 text-muted-foreground">
                                        <BookCheck className="size-5" />
                                        <div className="grid gap-0.5">
                                            <p>Read</p>
                                            <p className="text-xs" data-description>
                                                Get all or a single instance of the object.
                                            </p>
                                        </div>
                                    </div>
                                </SelectItem>
                                <SelectItem value="create">
                                    <div className="flex items-start gap-3 text-muted-foreground">
                                        <BadgePlus className="size-5" />
                                        <div className="grid gap-0.5">
                                            <p>Create</p>
                                            <p className="text-xs" data-description>
                                                Create a new instance of this object.
                                            </p>
                                        </div>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={() => addParameter()} className="mt-4">+ Add Function Parameter</Button>
                    {parameters.map((f, i) => (
                        <div className="flex items-center">
                            <div className="mb-2">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor={`field_name_${i}`} className="text-right">
                                        Param. Name
                                    </Label>
                                    <Input onChange={e => updateParameterName(i, e.target.value)} className="col-span-3" id={`field_name_${i}`} value={parameters[i].name} placeholder='Field Name' />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor={`field_type_${i}`} className="text-right">
                                        Param. Type
                                    </Label>
                                    <Select>
                                        <SelectTrigger
                                            id={`field_type_${i}`}
                                            className="mt-2 col-span-3 items-start [&_[data-description]]:hidden"
                                        >
                                            <SelectValue placeholder="Select a type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="string">
                                                <div className="flex items-start gap-3 text-muted-foreground">
                                                    <Rabbit className="size-5" />
                                                    <div className="grid gap-0.5">
                                                        <p>String</p>
                                                        <p className="text-xs" data-description>
                                                            Variable length text data.
                                                        </p>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="number">
                                                <div className="flex items-start gap-3 text-muted-foreground">
                                                    <Rabbit className="size-5" />
                                                    <div className="grid gap-0.5">
                                                        <p>Number</p>
                                                        <p className="text-xs" data-description>
                                                            Signed, 64-bit integer type.
                                                        </p>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="boolean">
                                                <div className="flex items-start gap-3 text-muted-foreground">
                                                    <Rabbit className="size-5" />
                                                    <div className="grid gap-0.5">
                                                        <p>Boolean</p>
                                                        <p className="text-xs" data-description>
                                                            Can store two values: true or false.
                                                        </p>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="address">
                                                <div className="flex items-start gap-3 text-muted-foreground">
                                                    <Rabbit className="size-5" />
                                                    <div className="grid gap-0.5">
                                                        <p>Address</p>
                                                        <p className="text-xs" data-description>
                                                            Solana base58 encoded addresses to refer to a wallet.
                                                        </p>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="time">
                                                <div className="flex items-start gap-3 text-muted-foreground">
                                                    <Rabbit className="size-5" />
                                                    <div className="grid gap-0.5">
                                                        <p>Time</p>
                                                        <p className="text-xs" data-description>
                                                            Our fastest model for general use cases.
                                                        </p>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button onClick={() => removeParameter(i)} className="w-12 h-12 rounded-md ml-2" style={{ padding: 2 }} variant="secondary">
                                <Minus className="w-10" />
                            </Button>
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    <Button onClick={() => createFunction(parseInt(appId), functionName, action, objId, parameters)} disabled={loading} type="submit">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}