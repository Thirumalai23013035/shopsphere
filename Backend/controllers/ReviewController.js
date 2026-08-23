const User = require("../models/User");

const Product = require("../models/Product");

const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Review = require("../models/Review");

const asynchandler = require("../utils/asynchandler");

const addReview = (asynchandler(async(req,res)=>{

    const {productId,rating,comment} = req.body;

    const product = await Product.findById(productId);

    const userId = req.user._id;

    if(!product)
    {
        return res.status(404).json({
            success:false,
            message:"Product not found"
        })
    }

    const existingReview = await Review.findOne({userId,productId})

    if(existingReview)
    {
        return res.status(404).json({
            success:false,
            message:"You Are Already Reviewed this Product"
        })
    }

    const review = await Review.create({
        productId,
        userId,
        rating,
        comment
    })

    const reviews = await Review.find({productId});

    let totalRating = 0;

    reviews.forEach((item)=>{

        totalRating = totalRating + item.rating

    })

    const averageRating = Number((totalRating / reviews.length).toFixed(1));

    product.rating = averageRating;
    product.reviews = reviews.length;

    await product.save();

    return res.status(201).json({
        success:true,
        message:"thanks for review",
        review
        

    })
}))

const getReviews = (asynchandler(async(req,res)=>{
    const reviews = await Review.find({productId : req.params.id}).populate("userId","name email").sort({createdAt:-1});

    return res.status(200).json({
        success:true,
        message:"Reviews fetched successfully",
        count:reviews.length,
        reviews
    })
}))

const updateReview = (asynchandler(async(req,res)=>{

    const review = await Review.findById(req.params.id);

    if(!review)
    {
        return res.status(200).json({
            message:"Review is not found",
            success:false

        })
    }

    if(req.user._id.toString()!=review.userId.toString() && req.user.role?.toLowerCase() !== 'admin')
    {
        return res.status(403).json({
            message:"403 forbidden",
            success:false

        })
    }

    const {comment,rating} = req.body;

    review.comment=comment;
    review.rating=rating;

    await review.save();

    const reviews  = await Review.find({productId:review.productId})

    let totalRating =0;

    reviews.forEach((item)=>{

        totalRating = totalRating+(item.rating);
    })

    const averageRating = reviews.length > 0 ? Number((totalRating / reviews.length).toFixed(1)) : 0;

    const product = await Product.findById(review.productId);
    if (product) {
      product.rating = averageRating;
      product.reviews = reviews.length;
      await product.save();
    }

    return res.status(200).json({
        message:"Review is updated",
        success:true,
        review
    })

}))

const deleteReview = (asynchandler(async(req,res)=>{
    
    const review = await Review.findById(req.params.id);

    if(!review)
    {
        return res.status(404).json({
            success:false,
            message:"review is not found",
        })
    }

    if(req.user._id.toString()!=review.userId.toString() && req.user.role?.toLowerCase() !== 'admin')
    {
        return res.status(403).json({
            message:"User access Denied",
            success:false
        })
    }

    const productId = review.productId;
    const reviewDelete = await Review.findByIdAndDelete(req.params.id);


    const reviews = await Review.find({ productId });
    let totalRating = 0;
    reviews.forEach((item) => {
        totalRating += item.rating;
    });
    const averageRating = reviews.length > 0 ? Number((totalRating / reviews.length).toFixed(1)) : 0;
    const product = await Product.findById(productId);
    if (product) {
        product.rating = averageRating;
        product.reviews = reviews.length;
        await product.save();
    }

    return res.status(200).json({
        success:true,
        message:"Review deleted successfully",
        reviewDelete
    })
}))



module.exports = {

    addReview,
    getReviews,
    updateReview,
    deleteReview

}