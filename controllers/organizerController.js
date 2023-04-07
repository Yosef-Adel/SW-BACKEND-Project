const Organizer = require("../models/Organizer");
const Organization = require("../models/Organization");

exports.createOrganizer = async(req,res)=> {
    try{
        if (!req.body.name){
            return res.status(400).json({message: "Organizer name is required"});
        }
        
        const organization = await Organization.findById(req.params.orgId);
        if (!organization){
            return res.status(400).json({message: "Organization not found."});
        }
        const organizerArray = organization.organizers;
        console.log(organizerArray);
        
        for (let i=0; i<organizerArray.length; i++)
        {
            console.log(organizerArray[i]);
            const org = await Organizer.findOne(organizerArray[i]);
            if(!org){
                return res.status(400).json({message: "Organizer not found"});
            }
            if (org.name == req.body.name){
                return res.status(400).json({message: "An organizer already exists with this name."})
            }
        }

        const organizer = await Organizer.create({...req.body});
        await organizer.save();
        organization.organizers.push(organizer._id);
        await organization.save();
        return res.status(200).json(organizer);
    }

    catch(err){
        console.log(err.message);
        return res.status(400).json({message: "Error in creating an organizer."})
    }
}

exports.editInfo = async(req,res)=>{
    try{
        const organizer = await Organizer.findById(req.params.organizerId);
        if(!organizer){
            return res.status(400).json({message: "Organizer not found"});
        }

        const updates = Object.keys(req.body);

        updates.forEach((element) => (organizer[element] = req.body[element]));
        
        await organizer.save();
        return res.status(200).json(organizer);

    }
    catch(err){
        console.log(err.message);
        return res.status(400).json({message: "Error in editing organizer info"});
    }
}

exports.getInfo = async(req,res) => {
    try{
        const organizer = await Organizer.findById(req.params.organizerId);
        if (!organizer){
            return res.status(400).json({message: "Organizer not found"})
        }
        return res.status(200).json(organizer);

    }
    catch(err){
        console.log(err.message);
        return res.status(400).json({message: "Error in getting user info"});
    }
}


exports.deleteOrganizer = async(req, res) =>{
    try{
        const org = await Organizer.findByIdAndDelete(req.params.organizerId);
        if(!org){
            return res.status(400).json({message: "Organizer not found"});
        }
        const organization = await Organization.findById(req.params.orgId);
        if(!organization){
            return res.status(400).json({message: "Organization not found"});
        }
        var organizersArray = organization.organizers;
        let organizerToDelete = req.params.organizerId;
        var organizersArray = organizersArray.filter(item => !organizerToDelete.includes(item));
        organization.organizers=organizersArray;
        await organization.save();
        // await organizer.save();

    }
    catch(err){
        console.log(err.message);
        return res.status(400).json({message: "Error in deleting organizer"});
    }
}