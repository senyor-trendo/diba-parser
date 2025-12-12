import { decodeHtmlEntities, stripHtmlTags } from "./parser-utils";
import { BookStatus } from "./parser.model";

export function extractBookStatus(html: string): BookStatus[] {
	const libraries: BookStatus[] = [];

	// Find the table content
	const tableMatch = html.match(/<table[^>]*class="bibItems"[^>]*>([\s\S]*?)<\/table>/i);
	if (!tableMatch) return libraries;

	const tableContent = tableMatch[1];

	// Find all library rows
	const rowRegex = /<tr[^>]*class="bibItemsEntry"[^>]*>([\s\S]*?)<\/tr>/gi;
	let rowMatch;

	while ((rowMatch = rowRegex.exec(tableContent)) !== null) {
		const rowContent = rowMatch[1];

		// Extract cells
		const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
		const cells: string[] = [];
		let cellMatch;

		while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
			let cellContent = cellMatch[1];

			// Clean the cell content
			cellContent = decodeHtmlEntities(stripHtmlTags(cellContent)).trim();
			cells.push(cellContent);
		}

		if (cells.length >= 4) {
			// Extract link from first cell if present
			const linkMatch = rowContent.match(/<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/);

			const library: BookStatus = {
				location: cells[0] || '',
				locationLink: linkMatch ? linkMatch[1] : '',
				signature: cells[1] || '',
				status: cells[2] || '',
				notes: cells[3] || ''
			};

			libraries.push(library);
		}
	}

	return libraries;
}