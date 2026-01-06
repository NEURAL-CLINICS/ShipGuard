import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { listAdapters } from "../scanners";
import { ruleSets } from "../scanners/rules";

const router = Router();

router.get("/", requireAuth, (_req, res) => {
  res.json({
    adapters: listAdapters(),
    ruleSets: Object.values(ruleSets).map((ruleSet) => ({
      id: ruleSet.id,
      name: ruleSet.name,
      ruleCount: ruleSet.rules.length
    }))
  });
});

export default router;
