const express= require('express')
const router= express.Router()
const nocache= require('nocache')
const bcrypt= require('bcrypt')
const User= require('./models/users')
const saltPassword=10

router.use(nocache())

//Login page base
router.get('/',(req,res)=>{
    if(!req.session.user){
        res.render('index',{title:'Login'})
    }
    else{
        res.redirect('/dashboard')
    }
})

router.get('/users/:id',(req,res)=>{
    const user = req.params.id
    res.send(`hi, ${user}`)
  })

//Login route
router.post('/login', async (req,res)=>{
    try{
        const data= await User.findOne({email: req.body.email})

        if(data){
            const passwordMatch= await bcrypt.compare(req.body.password, data.pass)

            if(passwordMatch){
                req.session.user= req.body.email
                res.redirect('/dashboard')
            }
            else{
                res.render('index',{
                    title: 'Login',
                    alert: 'Entered email and password is wrong'
                })
            }
        }
        else{
            res.render('signup',{
                title:'Signup',
                signup:'Account does not exist, Please singnup'
            })
        }
    }
    catch(err){
        console.log(err);
        res.status(500).send('Internal Server Error')
    }
})

//Dashboard route
router.get('/dashboard',(req,res)=>{
    if(req.session.user){
        res.render('dashboard',{title:'Home',user: req.session.user})
    }
    else{
        res.redirect('/')
    }
})

//Logout route
router.get('/logout',(req,res)=>{
    req.session.destroy(function (err){
        if(err){
            console.log(err)
            res.send('Error')
        }
        else{
            res.render('index',{
                title:'Login Page',
                logout:'Logout Successfully'
            })
        }
    })
})

//Signup route
router.get('/signup',(req,res)=>{
    res.render('signup',{title:'Signup'})
})

//Signup user
router.post('/signup',async (req,res)=>{
    const existingEmail= await User.findOne({email:req.body.email})
    const existingName= await User.findOne({name:req.body.name})

    if(existingEmail){
        res.render('signup',{
            title:'Signup',
            alert:'Email id already exist. Try with other email id'
        })
    }
    else if(existingName){
        res.render('signup',{
            title:'Signup',
            alert:'Username is already exist. Please try with another username'
        })
    }
    else{
        const hashedPassword= await bcrypt.hash(req.body.password,saltPassword)
        const user= new User({
            name:req.body.name,
            email:req.body.email,
            phone:req.body.phone,
            pass:hashedPassword
        })

        try{
            await user.save()
            res.redirect('/')
        }
        catch(err){
            res.json({message:err.message, type:'danger'})
        }
    }
})

//admin cridentials
const cridentials= {
    email:'admin@gmail.com',
    password:'12345'
}

//admin login
router.get('/adminlogin',(req,res)=>{
    if(!req.session.admin){
        res.render('adminlogin',{title:'Admin'})
    }
    else{
        res.redirect('/adminhome')
    }
})

//admin validation
router.post('/submit',(req,res)=>{
    if(
        req.body.email == cridentials.email&&
        req.body.password == cridentials.password
    ){
        
        req.session.admin = req.body.email
        res.redirect('/adminhome')
    }
    else{
        res.render('adminlogin',{
            title:'Admin Login',
            alert:'Invalid email or password'
        })
    }
})

//admin home
router.get('/adminhome',async (req,res)=>{
    try{
        if(req.session.admin){
            const users = await User.find().exec()
            res.render('adminhome',{
                title:'Admin Login',
                users:users
            })
        }
        else{
            res.redirect('/adminlogin')
        }
    }
    catch(err){
        res.json({message:err.message})
    }
})


//admin logout
router.get('/adminlogout',(req,res)=>{
    req.session.destroy((err)=>{
        if(err){
            console.log(err);
            res.send('Error found')
        }
        else{
            res.render('adminlogin',{
                title:'Admin Login',
                alert:'Logout Successfully'
            })
        }
    })
    })

    //add user page
    router.get('/adduser',(req,res)=>{
        if(!req.session.admin){
            res.redirect('/adminlogin')
        }
        else{
            res.render('adduser',{title:'Add User'})
        }
    })

    //add user to database
    router.post('/add',async (req,res)=>{
        const existingName =await User.findOne({name:req.body.name})
        const existingEmail= await User.findOne({email:req.body.email})

        if(existingEmail){
            res.render('adduser',{
                title:'Add User',
                alert:'Email already exist, Try with another one'
            })
        }
        else if(existingName){
            res.render('adduser',{
                title:'Add User',
                alert:'Username already exist, Try with another one'
            })
        }
        else{
            const hashedPassword= await bcrypt.hash(req.body.password,saltPassword)
        const user= new User({
            name:req.body.name,
            email:req.body.email,
            phone:req.body.phone,
            pass:hashedPassword
        })
        
            try{
                await user.save()
                res.redirect('/adminhome')
            }
            catch(err){
                res.json({message:err.message, type:'danger'})
            }
        }   
    })

    //Edit user
    router.get('/edit/:id',async(req,res)=>{
        try{
            const id = req.params.id
            const user =await User.findById(id).exec()
            if(!user){
                res.redirect('/adminhome')
            }
            else{
                res.render('edituser',{
                    title:'Edit user',
                    user:user
                })
            }
            
        }
        catch(err){
            console.log(err);
            res.redirect('/adminhome')
        }
        
    })

    //Update user
    router.post('/update/:id',async (req,res)=>{
        try{
            const id = req.params.id
            const result =await User.findByIdAndUpdate(id,{
                name:req.body.name,
                email:req.body.email,
                phone:req.body.phone
            }).exec()

            if(!result){
                res.json({message:'User Not Found',type:'danger'})
            }
            else{
                req.session.message ={
                    type: 'Success',
                    message:'Updated successfully'
                }
                res.redirect('/adminhome')
            }
        }
        catch(err){
            console.error(err);
            res.redirect('/adminhome')
        }
    })

    //Delete User
    router.get('/delete/:id',async (req,res)=>{
        try{
            const id = req.params.id
            const result = await User.findByIdAndDelete(id).exec()
            if(!result){
                res.json({message:'User Not Found',type:'danger'})
            }
            else{
                req.session.message={
                    type:'Success',
                    message:'Deleted Successfully'
                }
                res.redirect('/adminhome')
            }
        }
        catch(err){
            console.error(err)
            res.redirect('/adminhome')
        }
    })

module.exports= router