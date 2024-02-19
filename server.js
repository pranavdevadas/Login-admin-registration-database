const express= require('express')
const app= express()
require('dotenv').config()
const mongoose= require('mongoose')
const path= require('path')
const session= require('express-session')
const {v4:uuidv4}= require('uuid')

const PORT= process.env.PORT||5000



//connecting database
const db= mongoose.connect(process.env.DB_URI)
db.then(()=>{
    console.log('Database connected');
})
db.catch(()=>{
    console.log('Error in Connecting database');
})

//middleware
app.use(express.json())
app.use(express.urlencoded({extended:false}))   

//set template engine 
app.set('view engine','ejs')

//link css and validation to ejs
app.use('/static',express.static(path.join(__dirname,'public')))

app.use(session({
    secret:uuidv4(),
    resave:false,
    saveUninitialized:true,
}))

app.use((req,res,next)=>{
    res.locals.message= req.session.message
    delete req.session.message
    next()
})

//route prefix
app.use('',require('./routes'))

app.listen(PORT,()=>console.log(`Listening to server http://localhost:${PORT}`))



