import { Router } from "express";
import { TeamController } from "../controllers/team.controller";
import { authMiddleware as authenticate } from "../middlewares/auth.middleware";

const router = Router();
const controller = new TeamController();

router.use(authenticate);

router.post("/", controller.createTeam);
router.post("/sync", controller.syncProjectTeams);
router.get("/my-teams", controller.getUserTeams);
router.get("/all", controller.getAllTeams);
router.get("/project/:projectId", controller.getProjectTeams);
router.get("/:id/member-stats", controller.getTeamMemberStats);
router.get("/:id/top-earning", controller.getTopEarningProjects);
router.get("/:id/income-overview", controller.getYearlyIncomeOverview);
router.get("/:id/stats", controller.getTeamOverviewStats);
router.get("/:id", controller.getTeam);
router.patch("/:id", controller.updateTeam);
router.delete("/:id", controller.deleteTeam);

export default router;
