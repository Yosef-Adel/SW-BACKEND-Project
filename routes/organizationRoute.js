const orgController = require("../controllers/organizationController");
const organizerController = require("../controllers/organizerController");
const express = require('express');
const orgRouter = express.Router();


orgRouter.post("/create/:id", orgController.create);
orgRouter.post("/create/:id/organizer", organizerController.createOrganizer);


orgRouter.put("/edit/:orgId", orgController.editInfo);
orgRouter.put("/organizer/:organizerId", organizerController.editInfo);

orgRouter.get("/:orgId", orgController.getInfo);
orgRouter.get("/organizer/:organizerId", organizerController.getInfo);


module.exports = orgRouter;