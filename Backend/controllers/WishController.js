const User = require("../models/User");

const Product = require("../models/Product");

const Cart = require("../models/Cart");

const Order = require("../models/Order");

const WishList = require("../models/Wishlist");

const asynchandler = require("../utils/asynchandler");

const  wishlistAdd = (asynchandler(async(req,res)=>{

    const userId = req.user._id

    const {productId} = req.body;

    const wishlist = await WishList.create({
        userId,
        productId
    });

    return res.status(201).json({
        success:true,
        message:"Product is added to Wishlist",
        wishlist
    })

})) 


const getWishList = (asynchandler(async(req,res)=>{

    const userId = req.user._id;

    const wishlist = await WishList.find({ userId }).populate("productId","name brand price image imageURL stock")

    if(!wishlist || wishlist.length === 0)
    {
        return res.status(200).json({
            success:true,
            message:"wishlist is empty",
            wishlist: []
        })
    }

    return res.status(200).json({
        success:true,
        message:"Wishlist Products is Fetched Successfully",
        wishlist
    })
}))


const deleteWishList = (asynchandler(async(req,res)=>{

    const wishlist = await WishList.findByIdAndDelete(req.params.id);

    if(!wishlist)
    {
        return res.status(404).json({
            success:false,
            message:"Product is not found in wishlist",
        })
    }

    return res.status(200).json({
        success:true,
        message:"Wishlist Product is Deleted Successfully",
        wishlist
    })
}))

module.exports = {
    wishlistAdd,
    getWishList,
    deleteWishList
}