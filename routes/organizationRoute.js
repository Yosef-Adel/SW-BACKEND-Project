const orgController = require("../controllers/organizationController");
const organizerController = require("../controllers/organizerController");
const express = require('express');
const orgRouter = express.Router();


orgRouter.post("/create/:id", orgController.create);
orgRouter.post("/:orgId/organizer/create", organizerController.createOrganizer);

orgRouter.put("/edit/:orgId", orgController.editInfo);
orgRouter.put("/organizer/edit/:organizerId", organizerController.editInfo);

orgRouter.get("/:orgId", orgController.getInfo);
orgRouter.get("/organizer/:organizerId", organizerController.getInfo);

orgRouter.delete("/delete/:orgId", orgController.deleteOrganization);
orgRouter.delete("/:orgId/organizer/delete/:organizerId", organizerController.deleteOrganizer);


module.exports = orgRouter;