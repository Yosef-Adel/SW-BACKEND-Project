const Organization = require("../models/Organization");
const Organizer = require("../models/Organizer");
const User = require("../models/User");
const Event = require('../models/Events');

exports.create = async(req,res) => {
    try{
        if (!req.isCreator){
            return res.status(400).json({message: "You have to be a creator to create organization."});
        }

        if (!req.body.name){
        return res.status(400).json({message: "Organization name is required."});
        }
        
        const user = await User.findById(req.params.id);
        if(!user){
            return res.status(400).json({message: "User not found"});
        }
        
        const organization = await Organization.create({...req.body});
        if (req.file){
            organization.image=req.file.path;
        }
        organization.createdBy=user;
        user.organization=organization;
        
        user.save();
        await organization.save();
        return res.status(200).json({message: "Organization created successfully", organization});
    }
    catch(err){
        console.log(err.message);
        return res.status(400).json({message:"Error in creating organization."})
    }
}


exports.editInfo = async(req, res) => {
    try{
        if (!req.isCreator){
            return res.status(400).json({message: "You have to be a creator to create organization."});
        }
        const organization = await Organization.findById(req.params.orgId);
        if(!organization){
            return res.status(400).json({message: "Organization not found"});
        }

        const updates= Object.keys(req.body);

        updates.forEach((element)=> (organization[element] = req.body[element]));
        
        if (req.file){
            organization.image=req.file.path;
        }

        await organization.save();
        
        return res.status(200).json({message: "Organization info updated successfully", organization});
    }
    catch(err){
        console.log(err.message);
        return res.status(400).json({message: "Error in updating organization info"})
    }
}

exports.getInfo = async(req, res) => {
    try{
        if (!req.isCreator){
            return res.status(400).json({message: "You have to be a creator to create organization."});
        }
        const organization = await Organization.findById(req.params.orgId);
        if(!organization){
            return res.status(400).json({message: "Organization not found"});
        }

        return res.status(200).json({message: "Success", organization});

    }
    catch(err){
        console.log(err.message);
        return res.status(400).json({message: "Error in getting organization info"});
    }
}

exports.deleteOrganization = async(req, res) => {
    try{
        const organization = await Organization.findById(req.params.orgId);
        if(!organization){
            return res.status(400).json({message: "Organization not found"});
        }
        const organizerArray = organization.organizers;
        for (let i=0; i< organizerArray.length; i++){
            const organizer = await Organizer.deleteOne(organizerArray[i]);
            if (!organizer){
                return res.status(400).json({message: "Organizer not found"});
            }
        }
        await Organization.findByIdAndDelete(req.params.orgId);

        return res.status(200).json({message: "Organization deleted successfully", organization})
    }
    catch(err){
        console.log(err.message);
        return res.status(400).json({message: "Error in deleting organization"});
    }
}


exports.getEvents = async(req, res) => {
    try{
        if (!req.isCreator){
            return res.status(400).json({message: "You have to be a creator to create organization."});
        }
        
        const organization = await Organization.findById(req.params.orgId);
        if(!organization){
            return res.status(400).json({message: "Organization not found"});
        }
        
        var events = [];
        const organizersArray = organization.organizers;
        for (let i=0; i< organizersArray.length; i++){
            const event = await Event.findOne({"hostedBy" : organizersArray[i]})
            events.push(event);
        }
        
        if (events == null){
            res.status(400).json({message: "No events to show."});
        }

        return res.status(200).json({message :"Success", events});
    }
    catch(err){
        console.log(err.message);
        return res.status(400).json({message: "Error in getting organization events"});
    }
}