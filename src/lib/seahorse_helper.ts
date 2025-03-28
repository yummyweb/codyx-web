// Adds a new line to a string
function n(s: string) {
    return s + "\n"
}

// Adds an indent to the string
function ind(s: string) {
    return "\t" + s
}

// Adds a decorator to a function statement
function d(s: string, f: string) {
    return `@${s}\n${f}`
}

function t(s: string, f: boolean) {
    switch (s) {
        case "string": {
            return "str"
        }
        case "number": {
            return "i64"
        }
        case "boolean": {
            return "bool"
        }
        case "address": {
            if (f) return "Signer"
            else return "Pubkey"
        }
    }
}

function getAllImports() {
    return n("from seahorse.prelude import *")
}

//TODO: Change `any` to type of Object
function getFieldsFromObject(obj: any) {
    // The master string
    let master = ""

    for (let i = 0; i < obj.fields.length; i++) {
        const field = obj.fields[i]
        // Now, check for each fieldType and use the appropriate Python type
        master = n(master + ind(`${field.name}: ${t(field.fieldType, false)}`))
    }

    return master
}

//TODO: Change `any` to type of Object
function getAllAccounts(objs: Array<any>) {
    // The master string
    let master = ""

    // Iterate through objects
    for (let i = 0; i < objs.length; i++) {
        const obj = objs[i];
        // First, append the `Class` statement
        master = master + `class ${obj.name.replace(/ /g, "_")}(Account):`
        let fields = getFieldsFromObject(obj)
        master = n(n(n(master) + fields + ind("creator: Pubkey"))) // Double-spacing because this is the end of a class
    }
    return master
}

function getArgs(obj: any) {
    let master = ""

    for (let i = 0; i < obj.fields.length; i++) {
        const field = obj.fields[i]
        if (i === obj.fields.length - 1) {
            master = master + `${field.name}: ${t(field.fieldType, true)}`
        }
        else {
            master = master + `${field.name}: ${t(field.fieldType, true)}, `
        }
    }

    return master
}

//TODO: Change `any` to type of Object 
function getAllInstructions(objs: Array<any>) {
    // The master string
    let master = ""

    // Iterate through objects 
    for (let i = 0; i < objs.length; i++) {
        const obj = objs[i]

        let v = obj.name.replace(/ /g, "_")

        // First, append the `Function` statement
        const args = getArgs(obj)
        master = n(master) + d('instruction', `def init_${v}(${args}, _${v}: Empty[${v}], creator: Signer):`)

        // Rest of the instruction code
        let code = ""
        if (obj.fields[0].fieldType === "boolean") code = code + `_${v} = _${v}.init(payer = creator, seeds = ['${v}', creator, ${obj.fields[1].name}])`
        else code = code + `_${v} = _${v}.init(payer = creator, seeds = ['${v}', creator, ${obj.fields[0].name}])`

        // Now, loop through the fields and generate statements for each field
        for (let i = 0; i < obj.fields.length; i++) {
            const field = obj.fields[i]
            code = n(code) + ind(`_${v}.${field.name} = ${field.name}`)
        }

        // Final code line for the creator of the object
        code = n(code) + ind(`_${v}.creator = creator.key()`)

        master = n(n(master) + ind(code)) // Double-spacing because this is the end of a class
    }

    return master
}

function getHeaderComments() {
    return n("# Generated by Codyx")
}

// The exported Seahorse code consists of four parts:
//      - Header Comments
//      - Imports
//      - Accounts
//      - Instructions

export const compileFromJson = (modelJson: any) => {
    // console.log(modelJson)
    let comments = getHeaderComments()
    let imports = getAllImports()
    //TODO: Need to add a function for adding the `declare_id` with a placeholder like `<placeholder>`
    // Default id: declare_id('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS')
    let accounts = getAllAccounts(modelJson.objects) // Pass all objects
    let instructions = getAllInstructions(modelJson.objects) // Pass all objects 

    return n(comments) + n(imports) + n(n("declare_id('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS')")) + accounts + instructions
}