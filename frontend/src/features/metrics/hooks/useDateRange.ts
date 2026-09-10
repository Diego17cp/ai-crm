import { useState } from "react";

export function useDateRangeLast7Days() {
	const [hasta, setHasta] = useState<Date>(() => new Date());
	const [desde, setDesde] = useState<Date>(() => {
		const d = new Date();
		d.setDate(d.getDate() - 6);
		return d;
	});
	return { desde, hasta, setDesde, setHasta };
}