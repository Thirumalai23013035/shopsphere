const User = require("../models/User");

const Product = require("../models/Product");

const Cart = require("../models/Cart");

const Order = require("../models/Order");

const asynchandler = require("../utils/asynchandler");

const placeOrder = (asynchandler(async(req,res)=>{

    const userId = req.user._id;

    const cart = await Cart.find({userId}).populate("productId");

    if(cart.length==0)
    {
        return res.status(200).json({
            success:true,
            message:"Cart is empty"
        })
    }

    
    const items = cart.map((item)=>({
        
            
            productId:item.productId,
            quantity:item.quantity,
            price:item.productId.price
            
    }));
    
    let subtotal = 0;

    cart.forEach((item)=>{

        subtotal += item.productId.price * item.quantity;
    })

    let deliveryCharge = subtotal >=500 ? 0 : 50;

    let totalPrice = deliveryCharge + subtotal;
   
    const {shippingAddress,paymentMethod} = req.body;

    const order = await Order.create({

        userId,
        item:items,
        subtotal,
        deliveryCharge,
        totalPrice,
        paymentMethod:paymentMethod,
        shippingAddress:shippingAddress

    })

    await Cart.deleteMany({userId});

    return res.status(201).json({

        success:true,
        message:"Order Placed Successfully",
        order:order
    })
}));

const getOrders = (asynchandler(async(req,res)=>{

    const userId = req.user._id;

    const orders = await Order.find({userId}).sort({createdAt:-1})
    .populate("item.productId","name price imageURL brand");

    if(orders.length==0)
    {
        return res.status(404).json({

            success:false,
            message:"Orders not found"
        })
    }

    return res.status(200).json({
        success:true,
        message:"Orders fetched successfully",
        totalOrders:orders.length,
        order:orders

    })
}))

const getSingleOrder = (asynchandler(async(req,res)=>{

    const order = await Order.findById(req.params.id)
    .populate("userId","name email")
    .populate("item.productId","name price imageURL brand");
    
    
    if(!order)
    {
            return res.status(404).json({
                
                success:false,
                message:"Orders not found"
            })
    }
        
    if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== "Admin" && req.user.role !== "admin") 
    {
        return res.status(403).json({
            success: false,
            message: "Access denied"
    })};

    return res.status(200).json({
        success:true,
        message:"Order fetched successfully",
        order:order

    })
}))


const getAllOrders = (asynchandler(async(req,res)=>{

    const orders = await Order.find()
        .populate("userId","name email")
        .populate("item.productId","name price imageURL brand")
        .sort({ createdAt: -1 });

    return res.status(200).json({
        success:true,
        message:"Orders fetched successfully",
        totalOrders: orders.length,
        order:orders
    })
}))

const updateOrderStatus = (asynchandler(async(req,res)=>{

    const order = await Order.findById(req.params.id);

     if(!order)
    {
        return res.status(404).json({

            success:false,
            message:"Order not found"
        })
    }

    const {orderStatus} = req.body;

    const validStatus = ["Placed","Processing","Shipped","Delivered","Cancelled"]

    if(!validStatus.includes(orderStatus))
    {
         return res.status(400).json({

            success:false,
            message:"Invalid Status Updation"
        })
    }

    
    if(order.orderStatus=="Delivered" || order.orderStatus=="Cancelled")
    {
            return res.status(400).json({
                success:false,
                message:"OrderStatus cannot to change",
            })
    }
        
    order.orderStatus = orderStatus;

    await order.save();

    return res.status(200).json({
        success:true,
        message:"OrderStatus updated",
        order
    })

}))

const updatePaymentStatus = (asynchandler(async(req,res)=>{

    const order = await Order.findById(req.params.id);

    if(!order)
    {
        return res.status(404).json({
            success:true,
            message:"Order not found"
        })
    }
    const {paymentStatus} = req.body;

    const validPaymentStatus = ["Pending","Failed","Paid"];


    if(!validPaymentStatus.includes(paymentStatus))
    {
        return res.status(400).json({
            success:false,
            message:"Invalid paymentStatus Updation "
        })
    }


    order.paymentStatus = paymentStatus;

    await order.save();

    return res.status(200).json({
        message:"PaymentStatus updated successfully",
        success:true,
        order
    })
}))






module.exports = {
    placeOrder,
    getOrders,
    getSingleOrder,
    getAllOrders,
    updateOrderStatus,
    updatePaymentStatus
}