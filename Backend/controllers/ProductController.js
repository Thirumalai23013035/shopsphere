const Product = require("../models/Product");
const User = require("../models/User");
const asynchandler = require("../utils/asynchandler");
const cloudinary = require("../config/clodinary");
const fs = require("fs");


const asyncHandler = require("../utils/asynchandler");
const { logout } = require("./UserController");

const AddProduct = (asyncHandler(async(req,res)=>{
    const {name, description, price, category, stock, brand, rating, reviews, image, imageUrl, imageURL} = req.body;

    let finalImageUrl = imageURL || imageUrl || image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500";
    let finalPublicId = "";

    if (req.file) {
        try {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "ShopSphereProducts"
            });
            finalImageUrl = result.secure_url;
            finalPublicId = result.public_id;
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        } catch (cloudErr) {
            console.error("Cloudinary upload error in AddProduct:", cloudErr);
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            if (!finalImageUrl) {
                return res.status(400).json({
                    message: "Failed to upload image to Cloudinary",
                    success: false
                });
            }
        }
    }

    const product = await Product.create({
        name,
        description,
        price,
        category,
        stock,
        imageURL: finalImageUrl,
        publicId: finalPublicId,
        brand,
        rating: rating || 0,
        reviews: reviews || 0
    });

    res.status(201).json({
        success: true,
        message: "Product added successfully",
        product: {
            _id: product._id,
            id: product._id,
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            stock: product.stock,
            publicId: product.publicId,
            imageURL: product.imageURL,
            image: product.imageURL,
            brand: product.brand,
            rating: product.rating,
            reviews: product.reviews
        }
    });
}));

const getAllProducts = (asyncHandler(async(req,res)=>{

    const AllProducts = await Product.find();

    if(AllProducts.length==0)
    {
        return res.status(404).json({
            success:true,
            count:AllProducts.length,
            message:"Products not found"
        })
    }

    return res.status(200).json({

        success:true,
        count:AllProducts.length,
        message:"Successfully fetched all products",
        products:AllProducts

       
    })
}))

const addManyProducts = (asyncHandler(async(req,res)=>{


    const Addproducts = await Product.insertMany(req.body)

    return res.status(201).json({
        success:true,
        message:"Products Added Successfully",
        products:Addproducts
    })
        

}))


const getProduct = (asyncHandler(async(req,res)=>{

    const product = await Product.findById(req.params.id);

    if(!product)
    {
        return res.status(404).json({

            success:false,
            message:"Product Not Found"
        })
    }


    return res.status(200).json({
        message:"Product successfully fetched",
        success:true,

        product:{
            _id: product._id,
            id:product._id,
            name:product.name,
            description:product.description,
            price:product.price,
            category:product.category,
            stock:product.stock,
            imageURL: product.imageURL,
            image: product.imageURL,
            publicId:product.publicId,
            brand:product.brand,
            rating:product.rating,
            reviews:product.reviews
        }
    })
}))


const updateProduct = (asyncHandler(async(req,res)=>{

    const product = await Product.findById(req.params.id)
    
    if(!product)
    {
        return res.status(404).json({
            success:false,
            message:"Product Not Found"
        })
    }
    
    if(req.file)
    {
        try {
            if (product.publicId) {
                await cloudinary.uploader.destroy(product.publicId).catch(() => {});
            }

            const newImage = await cloudinary.uploader.upload(req.file.path, {
                folder: "ShopSphereProducts"
            });

            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            product.imageURL = newImage.secure_url;
            product.publicId = newImage.public_id;
        } catch (cloudErr) {
            console.error("Cloudinary upload error in updateProduct:", cloudErr);
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        }
    } else if (req.body.imageURL || req.body.imageUrl || req.body.image) {
        product.imageURL = req.body.imageURL || req.body.imageUrl || req.body.image;
    }
    
    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.price = req.body.price !== undefined ? Number(req.body.price) : product.price;
    product.category = req.body.category || product.category;
    product.stock = req.body.stock !== undefined ? Number(req.body.stock) : product.stock;
    product.brand = req.body.brand || product.brand;
    if (req.body.rating !== undefined) product.rating = Number(req.body.rating);
    if (req.body.reviews !== undefined) product.reviews = Number(req.body.reviews);

    await product.save();

    return res.status(200).json({
        message: "Product Successfully Updated",
        success: true,
        product: product
    });
}));


const deleteProduct = (asyncHandler(async(req,res)=>{

    

    const product = await Product.findById(req.params.id);

    if(!product)
        {
            return res.status(404).json({
                
                success:false,
                message:"Product Not Found"
            })
        }
        
    // Only attempt Cloudinary deletion if the product has an uploaded image
    if (product.publicId) {
        try {
            await cloudinary.uploader.destroy(product.publicId);
        } catch (cloudErr) {
            console.warn("Cloudinary delete warning (continuing):", cloudErr.message);
        }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({

        message:"Product successfully deleted",
        success:true
    })
}))


const searchProducts = (asynchandler(async(req,res)=>{

    const keyword = req.query.keyword || "";

    const searchedProducts = await Product.find({$or:[
        
        {name:{$regex:keyword,$options:"i"}},

        {brand:{$regex:keyword,$options:"i"}},

        {category:{$regex:keyword,$options:"i"}},

        {description:{$regex:keyword,$options:"i"}}
    ]})

    if(searchedProducts.length==0)
    {
        return res.status(404).json({
            message:"Product not found",
            products:[],
            success:false
        })
    }

    return res.status(200).json({
        success:true,
        message:"Product found successfully",
        count:searchedProducts.length,

        products:searchedProducts

    })
}))


const filterProducts = (asyncHandler(async(req,res)=>{

    const category = req.query.category || "";
    const brand  = req.query.brand ||"";

    const Products = await Product.find({$and:[

        {category:{$regex:category,$options:"i"}},
        {brand:{$regex:brand,$options:"i"}}

    ]})

    if(Products.length==0)
    {
        return res.status(404).json({
            message:"Product Not Found",
            products:[],
            success:false
        })
    }

    return res.status(200).json({
        message:"Products Fetched Founded",
        success:true,
        products:Products
    })
}))

const filterPrice = (asyncHandler(async(req,res)=>{

    const minprice = Number(req.query.minprice)||0; 
    const maxprice = Number(req.query.maxprice)||Number.MAX_SAFE_INTEGER;
    
    const priceFilter = await Product.find({
        price:{
            $gte:minprice,
            $lte:maxprice
        }
    })

    if(priceFilter.length==0)
    {
        return res.status(404).json({
            success:false,
            message:"product not found",
            products:[]
        })
    }

    return res.status(200).json({
        success:true,
        message:"Products fetched successfully",
        count:priceFilter.length,
        products:priceFilter

    })

    
}))


const sortProducts = (asynchandler(async(req,res)=>{
    const { sort, sortBy, order, category, brand, search, keyword, minPrice, maxPrice } = req.query;

    let filter = {};
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (brand) filter.brand = { $regex: brand, $options: 'i' };
    const searchKey = search || keyword;
    if (searchKey) {
        filter.$or = [
            { name: { $regex: searchKey, $options: 'i' } },
            { brand: { $regex: searchKey, $options: 'i' } },
            { category: { $regex: searchKey, $options: 'i' } },
            { description: { $regex: searchKey, $options: 'i' } }
        ];
    }
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let sortOption = { price: 1 };
    const selectedSort = sort || sortBy || (order === 'desc' ? 'price-desc' : 'price-asc');

    if (selectedSort === 'price-asc' || selectedSort === 'price_asc' || selectedSort === 'asc') {
        sortOption = { price: 1 };
    } else if (selectedSort === 'price-desc' || selectedSort === 'price_desc' || selectedSort === 'desc') {
        sortOption = { price: -1 };
    } else if (selectedSort === 'popularity' || selectedSort === 'popular') {
        sortOption = { rating: -1, stock: -1 };
    } else if (selectedSort === 'rating') {
        sortOption = { rating: -1 };
    } else if (selectedSort === 'newest') {
        sortOption = { _id: -1 };
    }

    const products = await Product.find(filter).sort(sortOption);

    return res.status(200).json({
        success: true,
        message: "Products sorted successfully",
        count: products.length,
        products: products,
        product: products
    });
}))

const Pagination = (asyncHandler(async(req,res)=>{

    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit)||10;

    const skip = (page-1) * limit;

    const products = await Product.find().skip(skip).limit(limit);

    const totalProducts = await Product.countDocuments();

    const totalPages = Math.ceil(totalProducts/limit);




    if(products.length==0)
    {
        return res.status(404).json({
            success:false,
            message:"Products not found",
            products:[]
        })
    }

    return res.status(200).json({
        message:"Products Fetched Successfully",
        success:true,
        currentPage:page,
        limit:limit,
        totalProducts:totalProducts,
        totalPages:totalPages,
        products:products
    })
}))

const uploadProductImage = (asyncHandler(async(req,res)=>{

        if(!req.file)
        {
            return res.status(404).json({
                success:false,
                message:"No images uploaded",
            })
        }

        const result = await cloudinary.uploader.upload(req.file.path);
        fs.unlinkSync(req.file.path);

        return res.status(200).json({
            success:true,
            message:"Image uploaded successfully",
            imageUrl:result.secure_url,
            publicId:result.public_id
        })
}))

const getCategories = (asyncHandler(async(req,res)=>{
    const categories = await Product.distinct("category");
    const filteredCategories = categories.filter(c => Boolean(c) && typeof c === 'string' && c.trim().length > 0);
    return res.status(200).json({
        success:true,
        message:"Categories fetched successfully",
        categories: filteredCategories
    });
}))

module.exports = {

    AddProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    filterProducts,
    filterPrice,
    addManyProducts,
    uploadProductImage,
    sortProducts,
    Pagination,
    getCategories,
    logout
}