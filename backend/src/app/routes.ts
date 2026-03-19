import { Router } from "express";
import { userRoutes } from "@/modules/users";
import { authRoutes } from "@/modules/auth";
import { chatbotRoutes } from "@/modules/chatbot";

const router: Router = Router();

router.use("/users", userRoutes());
router.use("/auth", authRoutes());
router.use("/chatbot", chatbotRoutes());

router.use("/", (_, res) => {
    res.json({
        message: "API",
        status: "running",
        timestamp: new Date().toISOString()
    });
})

export default router;