interface PrismaStringFilter {
	contains: string;
	mode: "insensitive";
}

type SearchCriteria<T extends string> = {
	[K in T]?: PrismaStringFilter;
};

type SearchConditionBlock<T extends string> = {
	OR: SearchCriteria<T>[];
};

export const generateSearchCondition = <T extends string>(
	q: string | undefined | null,
	fields: T[],
): SearchConditionBlock<T>[] => {
	if (!q || q.trim() === "") return [];

	const cleanQuery = q.trim();
	const words = cleanQuery.split(/\s+/);

	if (words.length > 1) {
		return words.map((word) => ({
			OR: fields.map(
				(field) =>
					({
						[field]: { contains: word, mode: "insensitive" },
					}) as SearchCriteria<T>,
			),
		}));
	}
	return [
		{
			OR: fields.map(
				(field) =>
					({
						[field]: { contains: cleanQuery, mode: "insensitive" },
					}) as SearchCriteria<T>,
			),
		},
	];
};

export const generateNestedSearchCondition = <T>(
	q: string | undefined | null,
	searchBuilder: (word: string) => T[]
): { OR: T[] }[] => {
	if (!q || q.trim() === "") return [];

	const cleanQuery = q.trim();
	const words = cleanQuery.split(/\s+/);

	if (words.length > 1) {
		return words.map((word) => ({
			OR: searchBuilder(word),
		}));
	}
	return [{ OR: searchBuilder(cleanQuery) }];
};
