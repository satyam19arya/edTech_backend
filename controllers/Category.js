const Category = require('../models/Category');

const createCategory = async (req, res) => {
    try{
        const {name, description} = req.body;

        if(!name || !description){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const categoryDetails = await Category.create({
            name,
            description
        });
        
        res.status(200).json({
            success: true,
            message: "Category created successfully",
            categoryDetails
        });

    } catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

const getAllCategories = async (req, res) => {
    try{
        const categories = await Category.find({});

        res.status(200).json({
            success: true,
            message: "Categories fetched successfully",
            categories
        });
    } catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

const categoryPageDetails = async (req, res) => {
    try{
        const {categoryId} = req.body;
        const selectedCategory = await Category.findById(categoryId)
                                                        .populate({
                                                            path: 'courses',
                                                            match: {status: 'Published'},
                                                            populate: "ratingAndReviews"
                                                        })
                                                        .exec();

        if(!selectedCategory){
            return res.status(400).json({
                success: false,
                message: "Category not found"
            });
        }

        if(selectedCategory.courses.length === 0){
            return res.status(400).json({
                success: false,
                message: "No courses found in this category"
            });
        }

        const differentCategories = await Category.find({_id: {$ne: categoryId}})
                                    .populate({
                                        path: 'courses',
                                        match: {status: 'Published'}                                    
                                    })
                                    .exec();

        // Get top-selling courses across all categories
        

        res.status(200).json({
            success: true,
            message: "Category details fetched successfully",
            selectedCategory,
            differentCategories
        });

    } catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

module.exports = {
    createCategory,
    getAllCategories,
    categoryPageDetails
}