const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");


const asynchandler = require("../utils/asynchandler");

const AddtoCart = (asynchandler(async(req,res)=>{

    const {productId, quantity} = req.body;

    const userId = req.user._id;

    console.log("Received ProductId:", productId);

    const product = await Product.findById(productId);

    console.log("Product =>", product);

    if(!productId || !product)
    {
        return res.status(404).json({
            success:false,
            message:"Product not found",
        })
    }

    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    const addQty = Number(quantity) > 0 ? Number(quantity) : 1;

    const existingProduct = await Cart.findOne({userId,productId});

    if(existingProduct)
    {
        existingProduct.quantity += addQty;

        await existingProduct.save();

        return res.status(200).json({
            success:true,
            message:"Quantity updated successfully",
            cart:existingProduct
        })
    }

    const cart = await Cart.create({
        userId:userId,
        productId:productId,
        quantity: addQty
    })

    return res.status(201).json({
        success:true,
        message:"Product successfully added to the cart",
        cart:cart
    })
}))

const getCart = (asynchandler(async(req,res)=>{


    const cart = await Cart.find({userId:req.user._id}).populate("productId");

    return res.status(200).json({
        success:true,
        message:"Successfully product fetched",
        cart:cart
    })


}))


 const increaseQuantity = (asynchandler(async(req,res)=>{

    const product = await Cart.findById(req.params.id);

    if(!product)
    {
        return res.status(404).json({
            success:false,
            message:"Product not found",

        })
    }


        product.quantity+=1;

        const increased = await product.save();

        return res.status(200).json({
            message:"Quantity Increased Successfully",
            success:true,
            product:increased
            
        })
    
 }))


 const decreaseQuantity = (asynchandler(async(req,res)=>{

    const product = await Cart.findById(req.params.id);

    if(!product)
    {
        return res.status(404).json({
            success:false,
            message:"Product not found",

        })
    }

    if(product.quantity>1)
    {
        product.quantity-=1;

        const decreased = await product.save();

         return res.status(200).json({
            message:"Quantity Increased Successfully",
            success:true,
            product:decreased
            
        })

    }

    const remove = await Cart.findByIdAndDelete(req.params.id);
     return res.status(200).json({
            message:"Product removed from Cart Successfully",
            success:true,
            product:remove
            
        })



 }))


 const removeFromCart = (asynchandler(async(req,res)=>{

    const product = await Cart.findById(req.params.id);

    if(!product)
    {
        return res.status(404).json({
            success:false,
            message:"Product not found",

        })
    }

     const remove = await Cart.findByIdAndDelete(req.params.id);
     return res.status(200).json({
            message:"Product removed from Cart Successfully",
            success:true,
            product:remove
            
        })

 }))

 const clearCart = (asynchandler(async(req,res)=>{

    const userId = req.user._id;

    const cart = await Cart.find({userId})

    if(cart.length==0)
    {
        return res.status(404).json({
            success:false,
            message:"Cart is already Empty",

        })
    }

    const remove = await Cart.deleteMany({userId});

     return res.status(200).json({
            message:"Products removed from Cart Successfully",
            success:true,
            product:remove
            
        })
}))


const cartTotal = (asynchandler(async(req,res)=>{

    const cart = await Cart.find({userId:req.user._id}).populate("productId");
    
     if(cart.length==0)
    {
        return res.status(404).json({
            success:false,
            message:"Cart is already Empty",

        })
    }

    let subtotal =0;


    cart.forEach((item)=>{

        subtotal = subtotal + item.productId.price * item.quantity;
    })

     let deliveryCharge = subtotal >=500 ? 0 : 50;

     let total = deliveryCharge + subtotal;

     return res.status(200).json({
        
        message:"Total Price Calculated",
        success:true,
        totalProducts:cart.length,
        subtotal:subtotal,
        deliveryCharge:deliveryCharge,
        totalprice:total,
        cart:cart

    })
}))


module.exports = {
    AddtoCart,
    getCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    cartTotal  
}