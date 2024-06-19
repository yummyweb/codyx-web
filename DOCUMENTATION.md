# Documentation

NOTE: The name of each field must be one word only, without hyphens. Underscores allowed. Also, the field `creator` is reserved. Cannot be used. Always check solana balance before deploying. ALso, the app must always be compiled before deploying, and with any change, it must be COMPILED first.

## API

`http://localhost:3000/api/project` --> Creates a new seahorse project in `dump/` folder
`http://localhost:3000/api/compile` --> Compiles and writes the code into new file
`http://localhost:3000/api/deploy` --> Deploys the existing seahorse project on the devnet

## Refactoring

- Add types in `src/types/` for all structs and objects in the application.
- Add types for props for functional components
- Clean up the dashboard UI, by converting much of it to components.
- Abstract the functions used in dashboard in a separate file in the `src/lib/`

## Smart Contract Engine

One of the core details of the smart contract engine is the so-called "master string", which is basically just a result variable returned at the end of each function. All of the code is appended to the master string, and it is then returned.

## Details

So, the main application page is divided as such you have two panels. The config panel, which is the left side and the editor panel which is right side. The config panel houses the settings or "info" of the app, like it's name, creator etc. so the "metadata", and it also houses the objects of the app. Why objects? because there is only space for either objects or actions, and since objects are more important than actions, i decided on objects. The idea is that selecting an object from the config panel will show up a flowchart on the editor with all of its corresponding actions. The point is for it to be a more interactive and intuitive editor. The editor panel also has the special AI feature with the AI input box at the bottom.