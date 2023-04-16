const orgController = require("../controllers/organizationController");
const organizerController = require("../controllers/organizerController");
const express = require('express');
const orgRouter = express.Router();
const multer = require('multer');
const cloudinaryStorage = require("../config/cloudinary")
const upload = new multer({storage: cloudinaryStorage.storage});
const authorization = require("../middleware/authorization");


orgRouter.post("/create/:id", authorization, orgController.create);
orgRouter.post("/:orgId/organizer/create", authorization, organizerController.createOrganizer);

orgRouter.put("/edit/:orgId", upload.single("image"), authorization, orgController.editInfo);
orgRouter.put("/organizer/edit/:organizerId", upload.single("image"),authorization, organizerController.editInfo);

orgRouter.get("/:orgId", authorization, orgController.getInfo);
orgRouter.get("/organizer/:organizerId", authorization, organizerController.getInfo);
orgRouter.get("/:orgId/events", authorization, orgController.getEvents);

orgRouter.delete("/delete/:orgId",orgController.deleteOrganization);
orgRouter.delete("/:orgId/organizer/delete/:organizerId", authorization, organizerController.deleteOrganizer);


module.exports = orgRouter;