const Organization = require("../models/Organization");
const Organizer = require("../models/Organizer");
const User = require("../models/User");

exports.create = async(req,res) => {
    try{
        if (!req.body.name){
        return res.status(400).json({message: "Organization name is required."});
        }
        const organization = await Organization.create({...req.body});
        const user = await User.findById(req.params.id);
        if(!user){
            return res.status(400).json({message: "user not found"});
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
        const organization = await Organization.findById(req.params.orgId);
        if(!organization){
            return res.status(400).json({message: "Organization not found"});
        }

        const updates= Object.keys(req.body);

        updates.forEach((element)=> (organization[element] = req.body[element]));
        
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
        const organization = await Organization.findById(req.params.orgId);
        if(!organization){
            return res.status(400).json({message: "Organization not found"});
        }

        return res.status(200).json(organization);

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
