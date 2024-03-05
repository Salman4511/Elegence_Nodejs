const Category = require("../models/category")

const titleCase = async (categoryName) => {
    try {
        const noSpecialCharacters = categoryName.replace(/[^a-zA-Z]/g, '');
        const newName = noSpecialCharacters.charAt(0).toUpperCase() +
            noSpecialCharacters.substr(1).toLowerCase();
        return newName;
    } catch (error) {
        console.log(error.message);
    }
}


const loadCategory = async (req, res) => {
    try {
        const categoryData = await Category.find({})
        res.status(200).json({ category: categoryData })
    } catch (error) {
        console.error("Error loading category data:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}



const addCategory = async (req, res) => {
    try {
        const cname = await titleCase(req.body.categoryName);
        const status = req.body.status;
        const offer = req.body.category_offer;
        const min = req.body.min_amount;
        const max = req.body.max_discount;
        const date = req.body.category_expiry;
        const checkCategory = await Category.findOne({ categoryName: cname });

        if (checkCategory) {
            return res.status(409).json({ status: 'error', message: "Category already exists.", category: checkCategory });
        }

        let newCategory;

        if (offer || min || max || date) {
            newCategory = new Category({
                categoryName: cname,
                categoryOffer: offer,
                minAmount: min,
                maxDiscount: max,
                expiry: date,
                active: status === "Active"
            });
        } else {
            newCategory = new Category({
                categoryName: cname,
                active: status === "Active"
            });
        }

        const savedCategory = await newCategory.save();

        if (savedCategory) {
            return res.status(201).json({ status: 'success', message: 'Category added successfully', category: savedCategory });
        } else {
            return res.status(500).json({ status: 'error', message: "Internal Server Error" });
        }
    } catch (error) {
        console.error("Error adding category:", error.message);
        return res.status(500).json({ status: 'error', message: "Internal Server Error" });
    }
};




const deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const category = await Category.findByIdAndDelete(categoryId);
        if (!category) {
            return res.status(404).json({ status: 'error', message: "Category not found" });
        }
        return res.status(200).json({ status: 'success', message: 'Category deleted successfully' });
    } catch (error) {
        console.error("Error deleting category:", error.message);
        return res.status(500).json({ status: 'error', message: "Internal Server Error" });
    }
};





const loadEditCategory = async (req, res) => {
    const categoryId = req.query.categoryId;
    try {
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).send('Category not found');
        }
        res.render('editCategory', { category });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}


const updateCategory = async (req, res) => {
    try {
        const id = req.body.id;
        const categoryName = req.body.categoryName;
        const status = req.body.status;
        const offer = req.body.category_offer;
        const min = req.body.min_amount;
        const max = req.body.max_discount;
        const date = req.body.category_expiry;
        const active = status === "Active";
        const cname = await titleCase(categoryName);
        const categoryData = await Category.findById(id);
        if (categoryData) {
            const checkData = await Category.findOne({ categoryName: cname, _id: { $ne: id } });

            if (!checkData) {
                let updatedCategory;

                if (offer || min || max || date) {
                    updatedCategory = await Category.findByIdAndUpdate(id, {
                        categoryName: cname,
                        categoryOffer: offer,
                        minAmount: min,
                        maxDiscount: max,
                        expiry: date,
                        active: active
                    }, { new: true });
                } else {
                    updatedCategory = await Category.findByIdAndUpdate(id, {
                        categoryName: cname,
                        active: active
                    }, { new: true });
                }

                if (updatedCategory) {
                    // return res.status(200).redirect("/admin/categories");
                    return res.status(200).json({ status: 'success', message: 'Category updated successfully', category: updatedCategory });
                } else {
                    return res.status(500).json({ status: 'error', message: "Internal Server Error" });
                }
            } else {
                return res.status(409).json({ status: 'error', message: "Category already exists.", category: categoryData });
            }
        } else {
            return res.status(404).json({ status: 'error', message: "Category not found" });
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ status: 'error', message: "Internal Server Error" });
    }
};





module.exports = {
    loadCategory,
    addCategory,
    loadEditCategory,
    deleteCategory,
    updateCategory
}