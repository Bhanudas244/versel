import express from 'express'
const app = express()
const port = 9000


app.use("/",(req,res)=>{
    try {
        res.json({message:"Hello From Express App"})
        
    } catch (error) {
       console.log(error); 
    }
})

app.listen(port,()=>{
    console.log(`Server running on port ${port}`);
})