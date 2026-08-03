const mongoose = require("mongoose");

const orderScheme = new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    item:[{

        productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product",
            required:true
        },

        quantity:{
            type:Number,
            required:true
        },

        price:{
            type:Number,
            required:true
        }
    }],

    subtotal:{
        type:Number,
        required:true
    },

    deliveryCharge:{
        type:Number,
        required:true
    },

    totalPrice:{
        type:Number,
        required:true

    },

    paymentMethod:{
        type:String,
        enum:["COD","Card","UPI","NetBanking"],
        required:true
    },

    paymentStatus:{
        type:String,
        enum:["Pending","Failed","Paid"],
        default:"Pending"
    },

    orderStatus:{
        type:String,
        enum:["Placed","Processing","Shipped","Delivered","Cancelled"],
        default:"Placed"
    },

    shippingAddress:{
        type:String,
        required:true
    }
},{

    timestamps:true
})

const Order = mongoose.model("Order",orderScheme);

module.exports = Order;