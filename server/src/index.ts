import express from "express"
import cors from "cors"
import dotenv from "dotenv"
const app = express()
dotenv.config()
const port = process.env.PORT || 3000;


app.use(cors())



app.listen(port,()=>{
	console.log(`connected to the port ${port}`)
})
