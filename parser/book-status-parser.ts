import { libsNameId } from "./libaries.name-id";
import { cleanText, decodeHtmlEntities, stripHtmlTags } from "./parser-utils";
import { FIELDS } from "./parser.config";
import { BookStatus, BookStatusType } from "./parser.model";

export default class BookStatusParser {
	static ROW_REGEX = /<tr[^>]*class="bibItemsEntry"[^>]*>([\s\S]*?)<\/tr>/gi;
	static CELL_REGEX = /<td[^>]*>([\s\S]*?)<\/td>/gi;
	//Some locations are hypen (-) separated and must be taken account
	static LOCATION_EXCLUDED_PATTERNS = [
		'A. Centelles',
		'Casagemes',
		'Caterina',
		'Francesc',
		'Marina',
		'Moner',
		'Picó',
		'PLEGAMANS',
		'Rafa J',
		'REIG',
		'Rosa',
		'Santa Creu'
	];

	static parse(html: string, language: string = 'ca'): BookStatus[] {
		const tableMatch = html.match(/<table[^>]*class="bibItems"[^>]*>([\s\S]*?)<\/table>/i);
		if (!tableMatch) return [];

		const libraries: BookStatus[] = [];
		const tableContent = tableMatch[1];

		// Find all library rows
		let rowMatch;

		while ((rowMatch = BookStatusParser.ROW_REGEX.exec(tableContent)) !== null) {
			const rowContent = rowMatch[1];

			// Extract cells
			const cells: string[] = [];
			let cellMatch;

			while ((cellMatch = BookStatusParser.CELL_REGEX.exec(rowContent)) !== null) {
				cells.push(decodeHtmlEntities(stripHtmlTags(cellMatch[1])).trim());
			}

			if (cells.length >= 4) {
				const location = BookStatusParser.getLocation(cells[0]);
				const statusText = cells[2] ?? '';
				const status = BookStatusParser.getStatus(statusText, language);

				const library: BookStatus = {
					libId: libsNameId[location]?? location,
					status,
					statusText: status !== BookStatusType.Available ? statusText : undefined,
					notes: cells[3] ? this.cleanNote(cells[3]) : undefined
				};

				libraries.push(library);
			}
		}

		return libraries;
	}
	private static cleanNote(text: string) {
		let note = cleanText(text).replace('v.', 'V.').replace('V;', 'V.').replace('V. 0', 'V.').replace('V. ', 'V.');
		
		if(note.length === 3){
			note = note.replace('V.', 'V.0');
		}
		
		return note;
	}
	private static getLocation(text: string): string {
		if (!text) return '';

		// Name comes often like SABADELL.La Serra-Infantil
		const separatorIdx = text.lastIndexOf('-');

		if (separatorIdx !== -1) {
			try {
				const textAfter = text.substring(separatorIdx + 1).trim(); // +1 to skip the dash
				const shouldNotTrim = BookStatusParser.LOCATION_EXCLUDED_PATTERNS.some(pattern => textAfter.trim().startsWith(pattern));

				if (!shouldNotTrim) {
					text = text.substring(0, separatorIdx).trim();
				}
			} catch (err) {
				console.log(err, text);
			}
		}

		// Remove possible text afterwards (newlines, etc.)
		return text.split(/\r\n|\r|\n/)[0].trim();
	}
	private static getStatus(text: string, language: string = 'ca'): BookStatusType {
		const status = FIELDS[language].status;
		switch (text) {
			case status.available:
				return BookStatusType.Available;

			case status.waitingForRetrieve:
				return BookStatusType.WaitingForRetrieve;

			case status.excluded:
				return BookStatusType.Excluded;

			default:
				if (text.indexOf(status.onLoan) !== -1) {
					return BookStatusType.OnLoan;
				}
		}

		return BookStatusType.Other;
	}
}