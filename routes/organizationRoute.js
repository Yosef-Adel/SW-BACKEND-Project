const orgController = require("../controllers/organizationController");
const organizerController = require("../controllers/organizerController");
const express = require('express');
const orgRouter = express.Router();


orgRouter.post("/create/:id", orgController.create);
orgRouter.post("/create/:orgId/organizer", organizerController.createOrganizer);


orgRouter.put("/edit/:orgId", orgController.editInfo);
orgRouter.put("/organizer/:organizerId", organizerController.editInfo);

orgRouter.get("/:orgId", orgController.getInfo);
orgRouter.get("/:orgId/organizer/:organizerId", organizerController.getInfo);

orgRouter.delete("/:orgId");
orgRouter.delete("/:orgId/organizer/:organizerId");

module.exports = orgRouter;