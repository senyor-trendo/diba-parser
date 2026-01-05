import { cleanText, decodeHtmlEntities, stripHtmlTags } from "./parser-utils";
import { FIELDS } from "./parser.config";
import { BookStatus, BookStatusType } from "./parser.model";

export default class BookStatusParser {
	static ROW_REGEX = /<tr[^>]*class="bibItemsEntry"[^>]*>([\s\S]*?)<\/tr>/gi;
	static CELL_REGEX = /<td[^>]*>([\s\S]*?)<\/td>/gi;

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
				//const linkMatch = rowContent.match(/<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/);
				const statusText = cells[2]?? '';
				const status = BookStatusParser.getStatus(statusText, language);

				const library: BookStatus = {
					location,
					//locationLink: linkMatch ? linkMatch[1] : '',
					signature: cells[1] || undefined,
					status,
					statusText: status !== BookStatusType.Available ? statusText : undefined,
					notes: cells[3]? this.cleanNote(cells[3]) : undefined
				};

				libraries.push(library);
			}
		}

		return libraries;
	}
	private static cleanNote(text: string){
		return cleanText(text).replace('v.', 'V.').replace('V;', 'V.').replace('V. 0', 'V.').replace('V. ', 'V.')
	}
	private static getLocation(text: string): string {
		if (text) {
			//PALAU-SOLITÀ es una excepció
			if(text.indexOf('PALAU-S') === -1){
				//Name comes often like SABADELL.La Serra-Infantil
				const separator = text.lastIndexOf('-');
			
				if (separator !== -1) {
					text = text.substring(0, separator);
				}
			}
			
			return text.split(/\r\n|\r|\n/)[0].trim(); //Remove possible text afterwards
		}

		return '';
	}
	private static getStatus(text: string, language: string = 'ca'): BookStatusType {
		const status = FIELDS[language].status;
		switch(text){
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