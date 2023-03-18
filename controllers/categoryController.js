const Category = require('../models/Category');
const Event = require('../models/Events');

// @route   GET api/categories/
// @desc    Get all categories
// @access  Public
exports.getAll = (req, res) => {
    Category.find()
        .then(categories => res.json(categories))
        .catch(err => res.status(400).json(err));
}

// @route   GET api/categories/:id
// @desc    Get category by id
// @access  Public
exports.getById = (req, res) => {
    Category.findById(req.params.id)
        .then(category => res.json(category))
        .catch(err => res.status(400).json(err));
}

// @route   POST api/categories/
// @desc    Create category
// @access  Public
exports.create = (req, res) => {
    const newCategory = new Category({
        name: req.body.name,
    });
    const message = "Category created successfully";

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
