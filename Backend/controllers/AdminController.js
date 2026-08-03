const User = require("../models/User");

const Product = require("../models/Product");

const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Review = require("../models/Review");

const asynchandler = require("../utils/asynchandler");


const getDetails = (asynchandler(async(req,res)=>{

    const totalUsers = await User.countDocuments();
    
    const totalProducts = await Product.countDocuments();

    const totalOrders = await Order.countDocuments();

    const orders = await Order.find();

    let totalRevenue = 0;
    
    orders.forEach((ord) => {
        if (Array.isArray(ord.item)) {
            ord.item.forEach((lineItem) => {
                totalRevenue += (lineItem.price || 0) * (lineItem.quantity || 1);
            });
        } else {
            totalRevenue += ord.totalPrice || 0;
        }
    })

    const pendingOrders = await Order.countDocuments({
        orderStatus:"Pending"
    });

    const skippedOrders = await Order.countDocuments({
        orderStatus:"Skipped"
    });

    const cancelledOrders = await Order.countDocuments({
        orderStatus:"Cancelled"
    });

    const deliveredOrders = await Order.countDocuments({
        orderStatus:"Delivered"
    });

    

    return res.status(200).json({
        success:true,
        message:"All details fetched successfully",
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
        skippedOrders,
        cancelledOrders,
        deliveredOrders
        
    })



}))

module.exports = {
    getDetails
}