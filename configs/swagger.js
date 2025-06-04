import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express"

const swaggerOptions = {
    swaggerDefinition:{
        openapi: "3.0.0",
        info:{
            title:"Banca Virtual API",
            version:"1.0.0",
            description:"API para el entorno de una banca en línea",
            contact:{
                name:"ByteForces",
                email:"ByteForce@kinal.edu.gt"
            }
        },
        servers:[
            {
                url:"http://127.0.0.1:3000/virtualBank/v1"
            }
        ]
    },
    apis:[
        "./src/auth/*.js",
        "./src/user/*.js"
    ]
}

const swaggerDocs = swaggerJSDoc(swaggerOptions)

export { swaggerDocs, swaggerUi }