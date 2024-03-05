const mongoose=require("mongoose");

const categorySchema=mongoose.Schema({
    categoryName:{
        type:String
    },
    categoryOffer:{
        type:Number
    },
    minAmount:{
        type:Number
    },
    maxDiscount:{
        type:Number
    },
    expiry:{
        type:String
    },
    active:{
        type:Boolean
    }
})

module.exports=mongoose.model("Category",categorySchema)