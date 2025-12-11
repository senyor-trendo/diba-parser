import { BookInfo, BookStatus, FIELDS } from "./parser.interfaces";

// Helper function to extract text by label in the bibDetail tables
function extractByLabel(html: string, label: string): string {
	// Look for the label in the HTML
	const labelIndex = html.indexOf(`>${label}<`);
	if (labelIndex === -1) return '';

	// Find the next td with class bibInfoData after this label
	const dataCellStart = html.indexOf('<td class="bibInfoData">', labelIndex);
	if (dataCellStart === -1) return '';

	const dataCellEnd = html.indexOf('</td>', dataCellStart);
	if (dataCellEnd === -1) return '';

	let content = html.substring(dataCellStart + '<td class="bibInfoData">'.length, dataCellEnd).trim();

	// Clean up the content - remove inner tags but keep their text
	content = content.replace(/<[^>]*>/g, '').trim();
	// Decode HTML entities
	content = content.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&nbsp;/g, ' ')
		.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
		.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)));

	return content;
}

// Main function to extract book info
export function extractBookInfo(htmlContent: string, language: string = 'ca'): BookInfo {
	const fields = FIELDS[language];

	// Extract title - find the first bibInfoData after Títol label
	const title = extractByLabel(htmlContent, fields.title);

	// Extract author
	const authorRaw = extractByLabel(htmlContent, fields.author);
	// Clean author - remove HTML tags if any
	const author = authorRaw.replace(/<[^>]*>/g, '').trim();

	// Extract publication
	const publication = extractByLabel(htmlContent, fields.pub);

	// Extract edition
	const edition = extractByLabel(htmlContent, fields.edition);

	// Extract description
	const description = extractByLabel(htmlContent, fields.description);

	// Extract collection
	const collection = extractByLabel(htmlContent, fields.collection);

	// Extract summary
	const summary = extractByLabel(htmlContent, fields.summary);

	// Extract uniform title
	const uniformTitle = extractByLabel(htmlContent, fields.uniformTitle);

	// Extract ISBN
	const isbn = extractByLabel(htmlContent, fields.isbn);

	// Extract image URL
	let imageUrl = '';
	const imgMatch = htmlContent.match(/<img[^>]*src=["']([^"']+)["'][^>]*id="fitxa_imatge"[^>]*>/);
	if (imgMatch) {
		imageUrl = imgMatch[1];
	} else {
		// Fallback: look for any img tag with src containing portadesbd.diba.cat
		const fallbackMatch = htmlContent.match(/src=["'](https?:\/\/portadesbd\.diba\.cat[^"']+)["']/);
		if (fallbackMatch) {
			imageUrl = fallbackMatch[1];
		}
	}

	// Extract permanent link
	let permanentLink = '';
	const permLinkMatch = htmlContent.match(/<a[^>]*id="recordnum"[^>]*href=["']([^"']+)["'][^>]*>/);
	if (permLinkMatch) {
		permanentLink = permLinkMatch[1];
	}

	return {
		title,
		author,
		publication,
		edition,
		description,
		collection,
		summary,
		uniformTitle,
		isbn,
		imageUrl,
		permanentLink
	};
}

// Alternative: More robust library extraction using regex
export function extractBookStatus(htmlContent: string): BookStatus[] {
	const libraries: BookStatus[] = [];

	// Regex to match each library row
	const rowRegex = /<tr\s+class="bibItemsEntry">(.*?)<\/tr>/gs;
	let rowMatch;

	while ((rowMatch = rowRegex.exec(htmlContent)) !== null) {
		const rowContent = rowMatch[1];

		// Extract cells from the row
		const cellRegex = /<td[^>]*>(.*?)<\/td>/gs;
		const cells: string[] = [];
		let cellMatch;

		while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
			let cellContent = cellMatch[1];

			// Extract link if present (for location cell)
			const linkMatch = cellContent.match(/<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/);
			if (linkMatch && cells.length === 0) { // First cell is location
				const locationLink = linkMatch[1];
				const location = linkMatch[2];

				// Clean location text
				const cleanLocation = location.replace(/&nbsp;/g, ' ').trim();

				// Create library entry
				const library: Partial<BookStatus> = {
					location: cleanLocation,
					locationLink: locationLink
				};

				// Add to array
				libraries.push({} as BookStatus);
				const lastIndex = libraries.length - 1;
				libraries[lastIndex].location = cleanLocation;
				libraries[lastIndex].locationLink = locationLink;

				cellContent = cleanLocation;
			} else {
				// Clean cell content
				cellContent = cellContent.replace(/<[^>]*>/g, '')
					.replace(/&nbsp;/g, ' ')
					.replace(/&amp;/g, '&')
					.trim();
			}

			cells.push(cellContent);
		}

		// Fill in the rest of the library info
		if (libraries.length > 0 && cells.length >= 4) {
			const lastIndex = libraries.length - 1;
			if (cells[1]) libraries[lastIndex].signature = cells[1];
			if (cells[2]) libraries[lastIndex].status = cells[2];
			if (cells[3]) libraries[lastIndex].notes = cells[3];
		}
	}

	return libraries;
}