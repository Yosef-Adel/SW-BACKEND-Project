//require promocode model
const Promocode = require('../models/Promocode');


//@route POST api/promocode/:event_id
//@desc create a new promocode
//@access public
const createPromocode = async (req, res, next) => {
        if (!(req.user)) {
            return res.status(400).json({ message: "User is not logged in." });
        }
        //check if the user is a creator or not since only creators can create promocodes
        if (!req.isCreator) {
            return res.status(400).json({ message: "User is not a creator." });
        }
        //check on all fields 
        if (!req.body.name || req.body.tickets==NaN || req.body.limit==NaN || req.body.startDate==NaN || req.body.endDate==NaN) {
            return res.status(400).json({ message: "All fields are required." });
        }
        //check if the body contains amount off or percent off
        if (!req.body.amountOff && !req.body.percentOff) {
            return res.status(400).json({ message: "Amount off or percent off is required." });
        }
        //check if given which one and store it
        //let -1 mean a flag that the field is not given
        let amountOff = -1;
        let percentOff = -1;
        if (req.body.amountOff) {
            amountOff = req.body.amountOff;
        }
        if (req.body.percentOff) {
            percentOff = req.body.percentOff;
        }

        

        try {
            const promocode = new Promocode({
            event: req.params.event_id,
            name: req.body.name,
            tickets: req.body.tickets,
            percentOff: percentOff,
            amountOff: amountOff,
            limit: req.body.limit,
            used: 0,
            startDate: new Date(req.body.startDate),
            endDate: new Date(req.body.endDate)
            });
            await promocode.save();
            res.status(201).json({ message: "Promocode created successfully!" });
        }
        
        catch (err) {
            return res.status(400).json({ message: err.message });
        }
};

//get a promocode by id
const getPromocode = async (req, res, next) => {
    if (!(req.user)) {
        return res.status(400).json({ message: "User is not logged in." });
    }
    //check if the user is a creator or not since only creators can get promocode details
    if (!req.isCreator) {
        return res.status(400).json({ message: "User is not a creator." });
    }

    try {
        const promocode = await Promocode.findById(req.params.promo_id);
        res.status(200).json({ promocode: promocode });
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
};

//update a promocode by id
const updatePromocode = async (req, res, next) => {
    if (!(req.user)) {
        return res.status(400).json({ message: "User is not logged in." });
    }

    //check if the user is a creator or not since only creators can update promocodes
    if (!req.isCreator) {
        return res.status(400).json({ message: "User is not a creator." });
    }

    //find the promocode by id and only update the fields that are given
    try {
        const promocode = await Promocode.findById(req.params.promo_id);
        if (req.body.name) {
            promocode.name = req.body.name;
        }
        if (req.body.tickets) {
            promocode.tickets = req.body.tickets;
        }
        if (req.body.percentOff) {
            promocode.percentOff = req.body.percentOff;
            promocode.amountOff = -1;
        }
        if (req.body.amountOff) {
            promocode.amountOff = req.body.amountOff;
            promocode.percentOff = -1;
        }
        if (req.body.limit) {
            promocode.limit = req.body.limit;
        }
        if (req.body.startDate) {
            promocode.startDate = new Date(req.body.startDate);
        }
        if (req.body.endDate) {
            promocode.endDate = new Date(req.body.endDate);
        }
        await promocode.save();
        res.status(200).json({ message: "Promocode updated successfully!" });
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }


    
};

//delete a promocode by id
const deletePromocode = async (req, res, next) => {
    if (!(req.user)) {
        return res.status(400).json({ message: "User is not logged in." });
    }
    //check if the user is a creator or not since only creators can delete promocodes
    if (!req.isCreator) {
        return res.status(400).json({ message: "User is not a creator." });
    }
    try {
        const promocode = await Promocode.findById(req.params.promo_id);
        await promocode.remove();
        res.status(200).json({ message: "Promocode deleted successfully!",
        promocode: promocode });
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
};

//get all promocodes for an event
const getPromocodes = async (req, res, next) => {
    if (!(req.user)) {
        return res.status(400).json({ message: "User is not logged in." });
    }
    //check if the user is a creator or not since only creators can get promocodes
    if (!req.isCreator) {
        return res.status(400).json({ message: "User is not a creator." });
    }
    try {
        const promocodes = await Promocode.find({event: req.params.event_id});
        res.status(200).json({ promocodes: promocodes });
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
};

const checkPromo= async (req, res) => {
    // //check if the user is logged in
    // if (!(req.user)) {
    //     return res.status(400).json({ message: "User is not logged in." });
    // }
    //take the promocode name from the body
    const promocodeName = req.params.promocode_name;
    //find the promocode by name
    const promocode = await Promocode.findOne({name: promocodeName});
    //check if the promocode exists
    if (!promocode) {
        return res.status(400).json({ message: "INVALID! Promocode does not exist." });
    }
    //check if the promocode is expired
    if (promocode.endDate < new Date() || promocode.startDate > new Date()) {
        return res.status(400).json({ message: "INVALID! Promocode is expired." });
    }
    //check if the promocode is used up
    if (promocode.used >= promocode.limit) {
        return res.status(400).json({ message: "INVALID! Promocode is used up." });
    }
    //check if the promocode is for the correct event
    if (promocode.event != req.params.event_id) {
        return res.status(400).json({ message: "INVALID! Promocode is not for this event." });
    }
    //all checks are passed so return the promocode
    return res.status(200).json({ message: "Promocode is valid.",
        promocode: promocode });

    

};



module.exports = {createPromocode, getPromocode, updatePromocode, deletePromocode, getPromocodes, checkPromo};


