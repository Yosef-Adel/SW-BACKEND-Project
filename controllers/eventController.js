const Event = require('../models/Events');
const Category = require('../models/Category');

// @route   Create api/events/
// @desc    Create event
// @access  Public
exports.create = (req, res) => {

    // Check if category exists
    const category = req.body.category;
    if (Category.findById(category) === null) {
        return res.status(400).json({ message: "Category does not exist" });
    }

    // Create event
    const newEvent = new Event({
        name: req.body.name,
        description: req.body.description,
        date: req.body.date,
        venue: req.body.location,
        image: req.body.image,
        category: req.body.category,
        capacity: req.body.capacity,
        summary: req.body.summary,
        hostedBy: req.body.hostedBy,
    });
    const message = "Event created successfully";

    newEvent.save()
        .then(event => res.json({ event, message }))
        .catch(err => res.status(400).json(err));
    
}

// @route   GET api/events?category=category_id&
// @desc    Get all events
// @access  Public
exports.getAll = (req, res) => {
    Event.find().populate('category')
        .then(events => res.json(events))
        .catch(err => res.status(400).json(err));
}

// @route   GET api/events/:id
// @desc    Get event by id
// @access  Public
exports.getById = (req, res) => {
    Event.findById(req.params.id).populate('category')
        .then(event => res.json(event))
        .catch(err => res.status(400).json(err));
}

// @route   PUT api/events/:id
// @desc    Update event by id
// @access  Public
exports.update = (req, res) => {
    const event = Event.findById(req.params.id);
    for (const key in req.body) {
        event[key] = req.body[key];
    }
    event.save()
        .then(event => res.json(event))
        .catch(err => res.status(400).json(err));
}

// @route   DELETE api/events/:id
// @desc    Delete event by id
// @access  Public
exports.delete = (req, res) => {
    Event.findByIdAndDelete(req.params.id)
        .then(event => res.json(event))
        .catch(err => res.status(400).json(err));
}

// @route   GET api/events/search?q=keyword
// @desc    Search events by name
// @access  Public
exports.search = (req, res) => {
    const query = req.query.q;
    if (query === undefined || query === "") {
        return res.status(400).json({ message: "Query is undefined" });
    }
    const events = Event.aggregate([
        {
            "$search": {
                "index": "eventsName",
                "autocomplete": {
                    "query": query,
                    "path": "name",
                }
            }
        }
    ]).then(events => res.json(events)).catch(err => res.status(400).json(err));


}

