import { decodeHtmlEntities, stripHtmlTags } from "./parser-utils";
import { FIELDS } from "./parser.config";
import { BookStatus, BookStatusType } from "./parser.model";

export function extractBookStatus(html: string, language: string = 'ca'): BookStatus[] {
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
			const location = getLocation(cells[0]);
			const linkMatch = rowContent.match(/<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/);
			const statusText = cells[2] || '';
			const status = getStatus(statusText, language);

			const library: BookStatus = {
				location: location,
				locationLink: linkMatch ? linkMatch[1] : '',
				signature: cells[1] || undefined,
				status: status,
				statusText: status !== BookStatusType.Available ? statusText : undefined,
				notes: cells[3] || undefined
			};

			libraries.push(library);
		}
	}

	return libraries;
}
function getLocation(text: string): string {
	if (text) {
		//Name comes often like SABADELL.La Serra-Infantil
		const separator = text.indexOf('-');
		console.log(text, separator)

		if (separator !== -1) {
			text = text.substring(0, separator);
		}

		return text;
	}

	return '';
}
function getStatus(text: string, language: string = 'ca'): BookStatusType {
	if (text === FIELDS[language].status.available) {
		return BookStatusType.Available;
	}
	if (text === FIELDS[language].status.waitingForRetrieve) {
		return BookStatusType.WaitingForRetrieve;
	}
	if (text === FIELDS[language].status.excluded) {
		return BookStatusType.Excluded;
	}
	if (text.indexOf(FIELDS[language].status.onLoan) !== -1) {
		return BookStatusType.OnLoan;
	}

	return BookStatusType.Other;
}