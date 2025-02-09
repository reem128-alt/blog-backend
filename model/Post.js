const mongoose=require("mongoose")

const PostSchema=new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    content:{
        type:String,
        require:true
    },
    title:{
        type:String,
        require:true,
        unique:true
    },
    image:{
        type:String,
        default:"https://www.hostinger.com/tutorials/wp-content/uploads/sites/2/2021/09/how-to-write-a-blog-post.png"
    },
    category:{
        type:String,
        required:true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
      },
    },
    { timestamps: true }
  );
  
  module.exports=mongoose.model("Post",PostSchema)