import { Router } from "express";
import { userRoutes } from "@/modules/users";
import { authRoutes } from "@/modules/auth";
import { chatbotRoutes } from "@/modules/chatbot";
import { dashboardRoutes } from "@/modules/dashboard";
import { proyectosRoutes } from "@/modules/projects";
import { ubigeosRoutes } from "@/modules/ubigeos";
import { lotesRoutes } from "@/modules/lot";
import { leadsRoutes } from "@/modules/leads";
import { appointmentsRoutes } from "@/modules/appointments";
import { salesRoutes } from "@/modules/sales";
import { clientsRoutes } from "@/modules/clients";

const router: Router = Router();

router.use("/users", userRoutes());
router.use("/auth", authRoutes());
router.use("/chatbot", chatbotRoutes());
router.use("/dashboard", dashboardRoutes());
router.use("/projects", proyectosRoutes());
router.use("/ubigeos", ubigeosRoutes());
router.use("/lotes", lotesRoutes());
router.use("/leads", leadsRoutes());
router.use("/clientes", clientsRoutes());
router.use("/citas", appointmentsRoutes());
router.use("/ventas", salesRoutes());

router.use("/", (_, res) => {
    res.json({
        message: "API",
        status: "running",
        timestamp: new Date().toISOString()
    });
})

export default router;