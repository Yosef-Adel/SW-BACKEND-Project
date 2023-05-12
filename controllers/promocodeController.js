//require promocode model
const Promocode = require('../models/Promocode');
const csv = require('csv-parser');

const NodeCache = require('node-cache');
// make the cache time to live be 2 minutes
const userCache = new NodeCache({ stdTTL: 120, checkperiod: 60 });

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
        const event=await Event.findById(req.params.event_id);
        if (!event) {
            return res.status(400).json({ message: "Event not found." });
        }

        //check on all fields 
        if (!req.body.name || req.body.tickets==NaN || req.body.limit==NaN || req.body.startDate==NaN || req.body.endDate==NaN) {
            return res.status(400).json({ message: "All fields are required." });
        }
        //check if the body contains amount off or percent off
        if (!req.body.amountOff && !req.body.percentOff) {
            return res.status(400).json({ message: "Amount off or percent off is required." });
        }
                //check if both are given
        if (req.body.amountOff && req.body.percentOff) {
            return res.status(400).json({ message: "Only one of amount off or percent off is required." });
        }
        // console.log(req.body.amountOff);
        // console.log(req.body.percentOff);
        //check if given which one and store it
        //let -1 mean a flag that the field is not given
        let amountOff = -1;
        let percentOff = -1;
        if (req.body.amountOff && !req.body.percentOff) {
            amountOff = req.body.amountOff;
        }
        if (req.body.percentOff && !req.body.amountOff) {
            percentOff = req.body.percentOff;
        }

        
        let limit=event.capacity;
        if (req.body.limit) {
            limit=req.body.limit;
        }

        try {
            const promocode = new Promocode({
            event: req.params.event_id,
            name: req.body.name,
            tickets: req.body.tickets,
            percentOff: percentOff,
            amountOff: amountOff,
            limit: limit,
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

const checkPromoSecured = async (req, res) => {
    // this is a secured function that checks the validity of the promocode
    // and counts the number of requests made by that user
    // will return if the promocode is valid or not and the number of requests made by the user
    // the max number of requests is 3

    //check if the user is logged in
    if (!(req.user)) {
        return res.status(400).json({ message: "User is not logged in." });
    }

    const userId = req.user.id;
    const cacheKey = `user-${userId}`;

    let count = userCache.get(cacheKey);

    // if the user has not made any requests, set the count to 1
    if (count == undefined) 
    {
        count = 1;
    } 
    // if the user has made less than 3 requests, increment the count

    else if (count <= 3)
    {
        count++;
    }
    // set the cache with the new count
    userCache.set(cacheKey, count);
    // if the user has made more than 3 requests, return an error
    if (count > 3) 
    {
        return res.status(400).json({ message: "You have exceeded the limit of this request." });
    }

    //take the promocode name from the body
    const promocodeName = req.params.promocode_name;
    //find the promocode by name
    const promocode = await Promocode.findOne({name: promocodeName});
    //check if the promocode exists
    if (!promocode) {
        return res.status(400).json({ message: "INVALID! Promocode does not exist." ,
        RequestCount: count});
    }
    //check if the promocode is expired
    if (promocode.endDate < new Date() || promocode.startDate > new Date()) {
        return res.status(400).json({ message: "INVALID! Promocode is expired." ,
        RequestCount: count
    });
    }
    //check if the promocode is used up
    if (promocode.used >= promocode.limit) {
        return res.status(400).json({ message: "INVALID! Promocode is used up." ,
        RequestCount: count});
    }
    //check if the promocode is for the correct event
    if (promocode.event != req.params.event_id) {
        return res.status(400).json({ message: "INVALID! Promocode is not for this event.",
        RequestCount: count });
    }
    
    //all checks are passed so return the promocode
    return res.status(200).json({ message: "Promocode is valid.",
        promocode: promocode,
        requestCount: count });
};


const uploadPromocodes = async (req, res) => {
    console.log("fdsf")
    if (!(req.user)) {
        return res.status(400).json({ message: "User is not logged in." });
    }
    //check if the user is a creator or not since only creators can create promocodes
    if (!req.isCreator) {
        return res.status(400).json({ message: "User is not a creator." });
    }
    console.log(req.body);
    const event=await Event.findById(req.params.event_id);
    console.log(event);
    if (!event) {
        return res.status(400).json({ message: "Event not found." });
    }

    //check on all fields 
    if (req.body.tickets==NaN || req.body.limit==NaN || req.body.startDate==NaN || req.body.endDate==NaN) {
        return res.status(400).json({ message: "All fields are required." });
    }
    //check if the body contains amount off or percent off
    // if (!req.body.amountOff && !req.body.percentOff) {
    //     return res.status(400).json({ message: "Amount off or percent off is required." });
    // }

        //check if both are given
        if (req.body.amountOff && req.body.percentOff) {
            return res.status(400).json({ message: "Only one of amount off or percent off is required." });
        }
        // console.log(req.body.amountOff);
        // console.log(req.body.percentOff);

    //check if given which one and store it
    //let -1 mean a flag that the field is not given
    let amountOff = -1;
    let percentOff = -1;
    if (req.body.amountOff && !req.body.percentOff) {
        amountOff = req.body.amountOff;
    }
    if (req.body.percentOff && !req.body.amountOff) {
        percentOff = req.body.percentOff;
    }


    
    let limit=event.capacity;
    if (req.body.limit) {
        limit=req.body.limit;
    }

    // try {
        // Get uploaded csv file
        const csvFile = req.file;
        console.log(csvFile);
        // Validate file format
        if (csvFile.mimetype !== "text/csv") {
            return res.status(400).json({ message: "Invalid file format. Only CSV files are allowed." });
        }
    
        // Convert csv file to json
        const csvData = [];
        csvFile.buffer.toString().split('\n').forEach(line => {
            if (line) {
                csvData.push(line.split(','));
            }
        });
        console.log(csvData[0]);
        
        // Convert codes to an array of strings
        let codes = csvData.map((code) => code[0]);
        
        // Remove spaces and special characters from codes
        codes = codes.map(code => code.replace(/(\r\n|\n|\r)/gm, ''));
        codes = codes.map(code => code.replace(/[^\w-_,@\.]/g, ''));
        
        console.log(codes);
        // Check if any invalid codes were found
        const invalidCodes = codes.some(code => !/^[a-zA-Z0-9-_@.]+$/.test(code));
        if (invalidCodes) {
            return res.status(400).json({ message: "Invalid promocode values provided. Only letters, numbers, hyphens, underscores, commas, at signs (@), and periods (.) are allowed." });
        }

        let tickets = req.body.tickets.split(',');
        // Remove spaces and special characters from tickets
        tickets = tickets.map(ticket => ticket.replace(" ", ''));
        console.log(tickets);
        // Whitelist fields and filter out invalid entries
        const validPromocodes = codes
        .map((promo) => ({
            event: req.params.event_id,
            name: promo,
            tickets: req.body.tickets,
            percentOff: percentOff,
            tickets: tickets,
            amountOff: amountOff,
            limit: limit,
            used: 0,
            startDate: new Date(req.body.startDate),
            endDate: new Date(req.body.endDate)
        }));
        
        // Check if any valid promocodes were found
        if (validPromocodes.length === 0) {
            return res.status(400).json({ message: "No valid promocodes found in the CSV file." });
        }
        console.log(validPromocodes);
    
        // Create new promocodes
        const promocodes = await Promocode.insertMany(validPromocodes);
        res.status(200).json({ message: "Promocodes uploaded successfully!", promocodes: promocodes });
    // } catch (err) {
    //     return res.status(400).json({ message: err.message });
    // }

}


module.exports = {createPromocode, getPromocode, updatePromocode, deletePromocode, getPromocodes, checkPromo,uploadPromocodes,checkPromoSecured};


