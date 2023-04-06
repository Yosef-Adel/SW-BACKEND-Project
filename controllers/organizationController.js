const Organization = require("../models/Organization");
const User = require("../models/User");

exports.create = async(req,res) => {
    try{
        if (!req.body.name){
        return res.status(400).json({message: "Organization creation error: name is required."});
        }
        const organization = await Organization.create({...req.body});
        const user = await User.findById(req.params.id);
        organization.createdBy=user;
        user.organization=organization;
        
        user.save();
        await organization.save();
        return res.status(200).json(organization);
    }
    catch(err){
        console.log(err.message);
        return res.status(400).json({message:"There is an error in creating organization."})
    }
}


exports.editInfo = async(req, res) => {
    try{
        const organization = await Organization.findById(req.params.orgId);

        const updates= Object.keys(req.body);

        updates.forEach((element)=> (organization[element] = req.body[element]));
        
        await organization.save();
        return res.status(200).json(organization);
        //return res.status(200).json({message: "Organization info updated successfully."});
    }
    catch(err){
        console.log(err.message);
        return res.status(400).json({message: "Error in updating organization info."})
    }
}

exports.getInfo = async(req, res) => {
    try{
        const organization = await Organization.findById(req.params.orgId);
        if(!organization){
            return res.status(400).json({message: "Organization does not exists"});
        }

        return res.status(200).json(organization);

    }
    catch(err){
        console.log(err.message);
        return res.status(400).json({message: "Error in getting organization info"});
    }
}
