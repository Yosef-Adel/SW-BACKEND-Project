//require promocode model
const Promocode = require('../models/Promocode');


//@route POST api/promocode/:event_id
//@desc create a new promocode
//@access public
const createPromocode = async (req, res, next) => {
        if (!(req.user)) {
            return res.status(400).json({ message: "User is not logged in." });
        }
        //check if the user is a creator or not since only creators can create tickets
        if (!req.isCreator) {
            return res.status(400).json({ message: "User is not a creator." });
        }
        //check on all fields 
        if (!(req.body.name && req.body.percentOff && req.body.limit && req.body.startDate && req.body.endDate)) {
            return res.status(400).json({ message: "All fields are required." });
        }
    
        try {
            const promocode = new Promocode({
            event: req.params.event_id,
            name: req.body.name,
            tickets: req.body.tickets,
            percentOff: req.body.percentOff,
            limit: req.body.limit,
            used: req.body.used,
            startDate: new Date(req.body.startDate),
            endDate: new Date(req.body.endDate)
            });
            await promocode.save();
            res.status(201).json({ message: "Promocode created successfully!" });
        }
        
        catch (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
}

module.exports = {createPromocode};


