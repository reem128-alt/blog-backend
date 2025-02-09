const mongoose=require("mongoose")

const CommentSchema=new mongoose.Schema({
    content:{
        type :String,
        required:true
    },
    userId:{
        type :mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    postId:{
        type :String,
        required:true
    },
    likes:{
        type:Array,
        default:[]
    },
    numberOfLikes:{
        type:Number,
        default:0
    }
    
},
    {timestamps:true}
)
        
module.exports=mongoose.model("Comment",CommentSchema)