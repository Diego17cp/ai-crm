import type { Telefono } from "@/core/types";
import {
	getPhoneHref,
	getPhoneIconType,
	getPhoneTypeColor,
} from "../utils/phone";

interface Props {
	tel: Telefono;
}

export const PhoneLinkBadge = ({
	tel
}: Props) => {
	const Icon = getPhoneIconType(tel.tipo);
	return (
		<a
			href={getPhoneHref(tel)}
      target="_blank"
			className={`
        flex justify-center items-center gap-2 border
        rounded-lg px-2.5 py-1.5
        text-sm
        ${getPhoneTypeColor(tel.tipo)}
        transition-colors
      `}
		>
			{/* eslint-disable-next-line react-hooks/static-components */}
			<Icon size={15} className="shrink-0" />
			<span className="min-w-0 truncate">{tel.numero}</span>
		</a>
	);
};
