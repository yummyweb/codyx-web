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
import { Loader2, Minus, MinusCircle, Rabbit } from "lucide-react"
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

export default function CreateObject({ appId }: any) {
    const [loading, setLoading] = useState<boolean>(false)
    const [objName, setObjName] = useState<string>("")
    //TODO: Use `Field` type, instead of any
    const [fields, setFields] = useState<Array<any>>([])

    // Hook for showing success/error messages
    const { toast } = useToast()

    // Field "arithmetic"
    const addField = () => {
        setFields(fields.concat([{
            name: "",
            type: ""
        }]))
    }

    const removeField = (i: number) => {
        setFields(fields.filter((item, idx) => idx !== i))
    }

    const updateFieldName = (i: number, name: HTMLInputElement["value"]) => {
        let _fields = [...fields]
        let field = { ..._fields[i] }
        field.name = name
        _fields[i] = field
        setFields(_fields)
    }

    const updateFieldType = (i: number, typeOfField: HTMLInputElement["value"]) => {
        let _fields = [...fields]
        let field = { ..._fields[i] }
        field.type = typeOfField
        _fields[i] = field
        setFields(_fields)
    }

    // Creating object
    const createObject = async (id: number, name: string, fields: Array<any>) => {
        try {
            const provider = getProvider();
            const program = new Program((idl as Idl), programID, provider);

            let fieldNames: string[] = []
            let fieldTypes: string[] = []
            for (let i = 0; i < fields.length; i++) {
                fieldNames.push(fields[i].name)
                fieldTypes.push(fields[i].type)
            }

            await program.rpc.addObjectToApplication(id, name, fieldNames, fieldTypes, {
                accounts: {
                    baseApplication: baseAccount.publicKey,
                    user: provider.wallet.publicKey,
                },
            })

            toast({
                description: "Successfully created object and added to application.",
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
                    Create Object
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[460px]">
                <DialogHeader>
                    <DialogTitle>Create an object</DialogTitle>
                    <DialogDescription>
                        Think of an object as an entity in your application that does some action or state change.
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
                            value={objName}
                            onChange={e => setObjName(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => addField()} className="mt-4">+ Add Field</Button>
                    {fields.map((f, i) => (
                        <div className="flex items-center">
                            <div className="mb-2">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor={`field_name_${i}`} className="text-right">
                                        Field Name
                                    </Label>
                                    <Input onChange={e => updateFieldName(i, e.target.value)} className="col-span-3" id={`field_name_${i}`} value={fields[i].name} placeholder='Field Name' />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor={`field_type_${i}`} className="text-right">
                                        Field Type
                                    </Label>
                                    <Select onValueChange={e => updateFieldType(i, e)}>
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
                            <Button onClick={() => removeField(i)} className="w-12 h-12 rounded-md ml-2" style={{ padding: 2 }} variant="secondary">
                                <Minus className="w-10" />
                            </Button>
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    <Button onClick={() => createObject(parseInt(appId), objName, fields)} disabled={loading} type="submit">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}