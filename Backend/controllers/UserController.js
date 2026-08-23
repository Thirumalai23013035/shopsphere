const User = require("../models/User");

const bcrypt = require("bcryptjs")

const asynchandler = require("../utils/asynchandler");

const generatetoken = require("../utils/generatetoken")

const protect = require("../middleware/authmiddleware");


const getProfile = (asynchandler(async(req,res)=>{

    return res.status(200).json({

        message:"Get the User profile successfully",
        user:req.user
    })
}))



// const createUser = async(req,res)=>{

//     try{

//         const password = await 

//         const newUser = await User.create(req.body);

//         res.status(201).json({

//             message:"User Created Successfully",
//             user: newUser
//         })
//     }

//     catch(error)
//     {
//         res.status(500).json({
//             message:error.message
//         })
//     }
// }

const registerUser = (asynchandler(async(req,res)=>{
    const { name, age, gender, role, password, email } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Name, email and password are required"
        });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: "User already exists"
        });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    try {
        const user = await User.create({
            name: name.trim(),
            age,
            gender: gender || "Prefer not to say",
            role: role || "user",
            password: hashPassword,
            email: email.toLowerCase().trim()
        });

        const token = generatetoken(user._id);

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            token,
            user: {
                _id: user._id,
                name: user.name,
                age: user.age,
                gender: user.gender,
                role: user.role,
                email: user.email
            }
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Unable to create user"
        });
    }
}));




const loginAPI = (asynchandler(async(req,res)=>{

    const {email,password} = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if(!user)
    {
        return res.status(401).json({
            message:"Invalid email or password",
            success:false
        })
    }

    const checkuser = await bcrypt.compare(password,user.password);

    if(!checkuser)
    {
        return res.status(401).json({
            message:"Invalid email or password",
            success:false
        })
    }

    const token = generatetoken(user._id);

    res.cookie("token",token,{
        httpOnly:true,
        sameSite:"Strict",
        maxAge:7 * 24 * 60 * 60 * 1000,
        secure:false,
    });

    return res.status(200).json({
        success:true,
        message:"login successfully",
        token,
        user:{
            _id :user._id,
            name:user.name,
            age:user.age,
            gender:user.gender,
            role:user.role,
            email:user.email
        }
    })
}))



const getUsers = asynchandler(async(req,res)=>{

        const allUsers = await User.find();

        if(allUsers.length==0)
        {
            return res.json({
                message:"users not found"
            })
        }

        res.status(200).json({

            message:"Users Fetched Successfully",
            users : allUsers

        })
    })



const getUserById = async(req,res)=>{

    try{
        const userId = await User.findById(req.params.id);

         if(!userId)
        {
            return res.json({
                message : "user not found"
            })
        }


        res.status(200).json({

            message: "User data fetched successfully",
            user : userId
        })

    }

    catch(error)
    {
        res.status(500).json({
            message:error.message
        })
    }

}


const updateUser = async(req,res)=>{

    try{

        const updatedUser = await User.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        });

        if(!updatedUser)
        {
            return res.json({
                message : "user not found"
            })
        }

        res.status(200).json({
            message:"User Data Updated Successfully",
            user:updatedUser
        })
    }

    catch(error)
    {
        res.status(400).json({
            message:error.message
        })
    }
}


// const deleteUser = (asynchandler(async(req,res)=>{

//     const user = await User.findById(req.params.id);

//     if(!user)
//     {
//         return res.status(404).json({
//             message:"User not found",
//             success:false
//         })
//     }

//     const deleteUser = await User.findByIdAndDelete(req.params.id);

//     return res.status(200).json({
//         message:" user succcessfully ",
//         success:true
//     })
// }))

const deleteUser = (asynchandler(async(req,res)=>{

    const dUser = await User.findByIdAndDelete(req.params.id);
    
    if(!dUser)
    {
        return res.status(404).res({
            message:"User not found",
            success:true
        })
    }

    return res.status(200).json({
        success:true,
        message:"User deleted successfully"
    })

}))
const logout = (asynchandler(async(req,res)=>{

    res.cookie("token","",{
        httpOnly:true,
        expires:new Date(0)
    });

    return res.status(200).json({
        message:"logout successfully",
        success:true

    })
}))


module.exports = {
    registerUser,
    loginAPI,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    
    getProfile,
    logout
};