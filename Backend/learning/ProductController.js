const addProduct = (req,res)=>{

    res.send("product added");
}

const deleteProduct = (req,res)=>{
    res.send("delete product");
}

module.exports = {

    addProduct,deleteProduct
};