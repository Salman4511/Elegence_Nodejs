const Brands = require("../models/brands");
const sharp = require("sharp")
const path = require('path');

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

const loadBrand = async (req, res) => {
    try {
        const brandDetails = await Brands.find({})
        res.status(200).json({ brands: brandDetails })
    } catch (error) {
        console.error("Error loading brand details:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}


const crop_brand_image = async (file) => {
    try {
        const randomInteger = Math.floor(Math.random() * 20000001);
        const imageDirectory = path.join(__dirname, "../public/admin/assets/imgs/brands/cropped");
        let imgFileName = "cropped" + randomInteger + ".jpg";
        let imagePath = path.join(imageDirectory, imgFileName);
        const croppedImage = await sharp(file)
            .resize(300, 300, {
                fit: "fill",
            })
            .toFile(imagePath);

        if (croppedImage) {
            return imgFileName;
        } else {
            console.log("Failed to crop the image");
        }
    } catch (error) {
        console.log(error.message);
    }
};


const addBrand = async (req, res) => {
    try {
        console.log(req.body);
        const brands = await Brands.find({});
     
        const status = req.body.status;
        console.log(req.file)
        console.log(req.body.brandName);
        const bname = await titleCase(req.body.brandName);
       
        const image = await crop_brand_image(req.file.path);
        console.log(image);
        const existingBrand = await Brands.find({ brandName: bname });

        if (existingBrand.length > 0) {
            return res.status(409).json({ message: "Brand already exists",brand:existingBrand });
        }

        let active = false;
        if (status === "Active") {
            active = true;
        }

        const brandData = new Brands({
            brandName: bname,
            image: image,
            active: active
        });

        const newBrand = await brandData.save();

        if (newBrand) {
            return res.status(200).json({ message: "Brand added successfully", brand: newBrand });
        } else {
            return res.status(500).json({ message: "Internal Server Error" });
        }

    } catch (error) {
        console.error("Error adding brand:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}




const deleteBrand = async (req, res) => {
    try {
        const brandId = req.params.brandId;
        const brand = await Brands.findByIdAndDelete(brandId);

        if (!brand) {
            return res.status(404).json({ message: "Brand not found" });
        }

        return res.status(200).json({ message: "Brand deleted successfully" });
    } catch (error) {
        console.error("Error deleting brand:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};



const loadEditBrand = async (req, res) => {
    const brandId = req.query.brandId;
    try {
        const brand = await Brands.findById(brandId);
        if (!brand) {
            return res.status(404).send('Brand not found');
        }
        res.render('editBrand', { brand });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}

const updateBrand = async (req, res) => {
    try {
        const { brandName, oldName, status, id } = req.body;
        const bname = await titleCase(brandName);
        let image;

        const brandData = await Brands.findById(id);
        console.log(req.file);

        if (req.file) {
            newimage = await crop_brand_image(req.file.path)
            image = newimage;
        } else {
            image = brandData.image;
        }

        const existingBrand = await Brands.findOne({ brandName: bname, _id: { $ne: id } });

        if (existingBrand) {
            return res.status(409).json({ message: "Brand already exists.", brand: brandData });
        }

        const confirmData = await Brands.findOne({ _id: id, brandName: oldName });

        if (brandData && confirmData) {
            const active = status === "Active";
            const newdata = await Brands.findByIdAndUpdate(id, { brandName: bname, active, image });

            if (newdata) {
                res.status(200).json({ message: "Brand updated successfully", brand: newdata });
            } else {
                res.status(500).json({ message: "Internal Server Error" });
            }
        } else {
            return res.json({message:"brand not found"});
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};






const deleteBrandImage = async (req, res) => {
    // const brands = await Brands.find({});
    const brandId = req.params.brandId;

    try {
        const brand = await Brands.findOne({ _id: brandId });
        if (!brand) {
            return res.status(404).send('Brand not found');
        }
        const change = await Brands.updateOne({ _id: brandId }, { $unset: { image: "" } })
        if (change) {
            res.redirect(`/admin/brands/edit/${ brandId }`);
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}


module.exports = {
    loadBrand,
    addBrand,
    deleteBrand,
    loadEditBrand,
    updateBrand,
    deleteBrandImage
}
