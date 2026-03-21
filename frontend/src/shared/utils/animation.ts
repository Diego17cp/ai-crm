import type { Variants } from "motion/react";

export const itemVariants: Variants = {
	hidden: {
		opacity: 0,
		y: 8,
	},
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.4,
			ease: "easeOut",
		},
	},
};