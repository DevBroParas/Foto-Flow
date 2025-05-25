import { Router } from "express";
import { protect } from "../Middleware/auth.middleware";
import {
  getAllPersons,
  getPersonById,
  updatePerson,
  deletePerson,
  deleteAllPersons,
} from "../Controller/person.controller";

const router = Router();

router.get("/", protect, getAllPersons);
router.delete("/delete-all", protect, deleteAllPersons);
router.get("/:id", protect, getPersonById);
router.patch("/:id", protect, updatePerson);
router.delete("/:id", protect, deletePerson);

export default router;
