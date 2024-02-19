const mongoose= require('mongoose')
const userScema= mongoose.Schema({
    name:{
    type:String,
    required:true
    },
    phone:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    pass:{
        type:String,
        required:true
    },
    created:{
        type:Date,
        required:true,
        default:Date.now
    }

})

module.exports= mongoose.model('User',userScema)