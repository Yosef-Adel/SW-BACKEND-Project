const orgController = require("../controllers/organizationController");
const organizerController = require("../controllers/organizerController");
const express = require('express');
const orgRouter = express.Router();
const multer = require('multer');
const cloudinaryStorage = require("../config/cloudinary")
const upload = new multer({storage: cloudinaryStorage.storage});


orgRouter.post("/create/:id", orgController.create);
orgRouter.post("/:orgId/organizer/create", organizerController.createOrganizer);

orgRouter.put("/edit/:orgId", upload.single("image"), orgController.editInfo);
orgRouter.put("/organizer/edit/:organizerId", upload.single("image"), organizerController.editInfo);

orgRouter.get("/:orgId", orgController.getInfo);
orgRouter.get("/organizer/:organizerId", organizerController.getInfo);
orgRouter.get("/:orgId/events", orgController.getEvents);

orgRouter.delete("/delete/:orgId", orgController.deleteOrganization);
orgRouter.delete("/:orgId/organizer/delete/:organizerId", organizerController.deleteOrganizer);


module.exports = orgRouter;