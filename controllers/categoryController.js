const Category = require('../models/Category');
const Event = require('../models/Events');

// @route   GET api/categories/
// @desc    Get all categories
// @access  Public
exports.getAll = (req, res) => {
    const message = "Categories retrieved successfully";
    const errorMessage = "Categories not found";
    Category.find()
        .then(categories => res.json({ categories, message }))
        .catch(err => res.status(400).json({ errorMessage, err }));
}

// @route   GET api/categories/:id
// @desc    Get category by id
// @access  Public
exports.getById = async (req, res) => {
    const message = "Category retrieved successfully";
    const errorMessage = "Category not found";
    const category = await Category.findById(req.params.id)
    if (!category) {
        return res.status(404).json({ "message":errorMessage });
    }
    return res.json({ category, message });

}

// @route   POST api/categories/
// @desc    Create category
// @access  Public
exports.create = async (req, res) => {
    
    const message = "Category created successfully";
    const dublicateErrorMessage = "Category already exists";
    const noNameErrorMessage = "Category name is required";

    // Check if category name is provided
    if (!req.body.name) {
        return res.status(400).json({ "message": noNameErrorMessage });
    }

    // Check if category already exists
    const anyCategory = await Category.exists({ name: req.body.name });
    if (anyCategory) {
        return res.status(400).json({ "message": dublicateErrorMessage });
    }

    const newCategory = new Category({
        name: req.body.name,
    });

    newCategory.save()
        .then(category => res.json({ category, message }))
        .catch(err => res.status(400).json(err));
    
    
}

// @route   PUT api/categories/:id
// @desc    Update category by id
// @access  Public
exports.update = (req, res) => {
    const category = Category.findById(req.params.id);
    for (const key in req.body) {
        category[key] = req.body[key];
    }
    category.save()
        .then(category => res.json(category))
        .catch(err => res.status(400).json(err));
}

// @route   DELETE api/categories/:id
// @desc    Delete category by id
// @access  Public
exports.delete = (req, res) => {
    Category.findByIdAndDelete(req.params.id)
        .then(category => res.json(category))
        .catch(err => res.status(400).json(err));
}

// @route   GET api/categories/:id/events
// @desc    Get events by category id
// @access  Public
exports.getEvents = (req, res) => {
    Event.find({ category: req.params.id })
        .then(events => res.json(events))
        .catch(err => res.status(400).json(err));
    
}
