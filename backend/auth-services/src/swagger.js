import swaggerAutoGen from "swagger-autogen"
const doc={
    info:{
        title:" Auth Service API",
        description:'Automatically generate swagger docs',
        version:"1.0.0"
    },
    host:"localhost:5001",
    schemes:["http"]
}
const outputFile="./swagger-output.json"
const endpointFiles=["./routes/auth.routes.ts"]

swaggerAutoGen()( outputFile,endpointFiles,doc  )