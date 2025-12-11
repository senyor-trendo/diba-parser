export interface BookInfo {
	title: string;
	author: string;
	publication: string;
	edition: string;
	description: string;
	collection: string;
	summary: string;
	uniformTitle: string;
	isbn: string;
	imageUrl: string;
	permanentLink: string;
}

export interface BookStatus {
	location: string;
	locationLink: string;
	signature: string;
	status: string;
	notes: string;
}

const FIELDS = {
	ca: {
		author: 'Autor/Artista',
		collection: 'Col&middot;lecci&oacute;',
		description: 'Descripci&oacute;',
		edition: 'Edici&oacute;',
		isbn: 'ISBN',
		pub: 'Publicació',
		summary: 'Sinopsi',
		title: 'Títol',
		uniformTitle: 'Títol uniforme'
	},
	en: {
		author: 'Author/Artist',
		collection: 'Series',
		description: 'Description',
		edition: 'Edition',
		isbn: 'ISBN',
		pub: 'Publication',
		summary: 'Summary',
		title: 'Title',
		uniformTitle: 'Uniform title'
	},
	es: {
		author: 'Autor/Artista',
		collection: 'Colección',
		description: 'Descripción',
		edition: 'Edición',
		isbn: 'ISBN',
		pub: 'Publicación',
		summary: 'Sumario',
		title: 'Título',
		uniformTitle: 'Título uniforme'
	}
}

// Helper function to decode HTML entities
function decodeHtmlEntities(text: string): string {
	const entityMap: { [key: string]: string } = {
		'&amp;': '&',
		'&lt;': '<',
		'&gt;': '>',
		'&quot;': '"',
		'&#39;': "'",
		'&nbsp;': ' ',
		'&aacute;': 'á',
		'&eacute;': 'é',
		'&iacute;': 'í',
		'&oacute;': 'ó',
		'&uacute;': 'ú',
		'&ntilde;': 'ñ',
		'&ccedil;': 'ç',
		'&egrave;': 'è',
		'&agrave;': 'à',
		'&igrave;': 'ì',
		'&ograve;': 'ò',
		'&ugrave;': 'ù',
		'&uuml;': 'ü',
		'&ldquo;': '"',
		'&rdquo;': '"',
		'&lsquo;': "'",
		'&rsquo;': "'"
	};

	return text.replace(/&[a-z0-9#]+;/gi, (match) => {
		// Handle numeric entities
		if (match.startsWith('&#x')) {
			const hex = match.substring(3, match.length - 1);
			try {
				return String.fromCharCode(parseInt(hex, 16));
			} catch {
				return match;
			}
		} else if (match.startsWith('&#')) {
			const dec = match.substring(2, match.length - 1);
			try {
				return String.fromCharCode(parseInt(dec, 10));
			} catch {
				return match;
			}
		}
		return entityMap[match.toLowerCase()] || match;
	});
}

// Helper function to clean HTML tags from text
function stripHtmlTags(text: string): string {
	return text.replace(/<[^>]*>/g, '');
}

// Helper function to extract text by label in tables
function extractByLabel(html: string, label: string): string {
	// Pattern to find the label and its corresponding data cell
	const pattern = new RegExp(
		`class="bibInfoLabel"[^>]*>\\s*${label}\\s*<[^>]*>[^<]*<td[^>]*class="bibInfoData"[^>]*>([\\s\\S]*?)</td>`,
		'i'
	);

	const match = html.match(pattern);
	if (match && match[1]) {
		const content = match[1];
		// Clean the content
		const cleaned = stripHtmlTags(content).trim();
		return decodeHtmlEntities(cleaned);
	}

	return '';
}

// Main function to extract book info
export function extractBookInfo(htmlContent: string, language: 'ca' | 'es' | 'en' = 'ca'): BookInfo {
	const fields = FIELDS[language];

	// Extract title
	const title = extractByLabel(htmlContent, fields.title);

	// Extract author
	const author = extractByLabel(htmlContent, fields.author);

	// Extract publication
	const publication = extractByLabel(htmlContent, fields.pub);

	// Extract edition
	const edition = extractByLabel(htmlContent, fields.edition);

	// Extract description
	const description = extractByLabel(htmlContent, fields.description);

	// Extract collection
	const collection = extractByLabel(htmlContent, fields.collection);

	// Extract summary
	const summary = extractByLabel(htmlContent,fields.summary);

	// Extract uniform title
	const uniformTitle = extractByLabel(htmlContent, fields.uniformTitle);

	// Extract ISBN
	const isbn = extractByLabel(htmlContent, fields.isbn);

	// Extract image URL
	let imageUrl = '';
	const imgRegex = /<img[^>]*id="fitxa_imatge"[^>]*src="([^"]*)"[^>]*>/i;
	const imgMatch = htmlContent.match(imgRegex);
	if (imgMatch && imgMatch[1]) {
		imageUrl = imgMatch[1];
	} else {
		// Fallback: look for any img with portadesbd.diba.cat
		const fallbackRegex = /src="(https?:\/\/portadesbd\.diba\.cat[^"]*)"/i;
		const fallbackMatch = htmlContent.match(fallbackRegex);
		if (fallbackMatch && fallbackMatch[1]) {
			imageUrl = fallbackMatch[1];
		}
	}

	// Extract permanent link
	let permanentLink = '';
	const linkRegex = /<a[^>]*id="recordnum"[^>]*href="([^"]*)"[^>]*>/i;
	const linkMatch = htmlContent.match(linkRegex);
	if (linkMatch && linkMatch[1]) {
		permanentLink = linkMatch[1];
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

// Function to extract library statuses
export function extractLibraryStatuses(htmlContent: string): BookStatus[] {
	const libraries: BookStatus[] = [];

	// Find the library items table
	const tableStart = htmlContent.indexOf('<table class="bibItems"');
	if (tableStart === -1) return libraries;

	// Find table rows
	let currentIndex = htmlContent.indexOf('<tr', tableStart);

	while (currentIndex !== -1) {
		const nextTr = htmlContent.indexOf('<tr', currentIndex + 1);
		const trEnd = htmlContent.indexOf('</tr>', currentIndex);

		if (trEnd === -1) break;

		const rowContent = htmlContent.substring(currentIndex, Math.min(trEnd + 5, nextTr !== -1 ? nextTr : htmlContent.length));

		// Check if this is a library entry row (not header)
		if (rowContent.includes('bibItemsEntry')) {
			// Extract all td cells
			const cells: string[] = [];
			let tdIndex = 0;

			while (true) {
				const tdStart = rowContent.indexOf('<td', tdIndex);
				if (tdStart === -1) break;

				const tdEnd = rowContent.indexOf('</td>', tdStart);
				if (tdEnd === -1) break;

				const cellContent = rowContent.substring(tdStart, tdEnd);

				// Extract text content, handling links
				let text = cellContent;

				// Check for links in the first cell
				if (cells.length === 0) {
					const linkMatch = cellContent.match(/<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/);
					if (linkMatch) {
						const library: BookStatus = {
							location: decodeHtmlEntities(stripHtmlTags(linkMatch[2])).trim(),
							locationLink: linkMatch[1],
							signature: '',
							status: '',
							notes: ''
						};
						libraries.push(library);
						text = linkMatch[2]; // Use link text for the cell content
					}
				}

				// Clean the cell text
				const cleanText = decodeHtmlEntities(stripHtmlTags(text)).trim();
				cells.push(cleanText);

				tdIndex = tdEnd + 5;
			}

			// If we found link in first cell and have other cells, fill the library info
			if (libraries.length > 0 && cells.length >= 4) {
				const lastLib = libraries[libraries.length - 1];
				lastLib.signature = cells[1] || '';
				lastLib.status = cells[2] || '';
				lastLib.notes = cells[3] || '';
			}
		}

		currentIndex = nextTr;
	}

	return libraries;
}

// Alternative regex-based library extraction (simpler)
export function extractLibraryStatusesRegex(htmlContent: string): BookStatus[] {
	const libraries: BookStatus[] = [];

	// Find the table content
	const tableMatch = htmlContent.match(/<table[^>]*class="bibItems"[^>]*>([\s\S]*?)<\/table>/i);
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

// Utility function to parse HTML from a string
export function parseHtmlString(htmlString: string, language: 'ca'|'es'|'en'): {
	bookInfo: BookInfo;
	libraryStatuses: BookStatus[];
} {
	return {
		bookInfo: extractBookInfo(htmlString, language),
		libraryStatuses: extractLibraryStatusesRegex(htmlString)
	};
}