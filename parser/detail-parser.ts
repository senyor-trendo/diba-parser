import BookStatusParser from "./book-status-parser";
import { cleanText, decodeHtmlEntities, fixBookTitle, stripHtmlTags } from "./parser-utils";
import { FIELDS } from "./parser.config";
import { BookInfo, BookStatus } from "./parser.model";

/**
 * Extracts text by label in tables
 * 
 * @param html 
 * @param label 
 * @returns 
 */
function extractByLabel(html: string, label: string): string {
	// Pattern to find the label and its corresponding data cell
	const pattern = new RegExp(
		`class="bibInfoLabel"[^>]*>\\s*${label}\\s*<[^>]*>[^<]*<td[^>]*class="bibInfoData"[^>]*>([\\s\\S]*?)</td>`,
		'i'
	);

	const match = html.match(pattern);
	if (match && match[1]) {
		const content = match[1];

		return decodeHtmlEntities(stripHtmlTags(content).trim());
	}

	return '';
}
/**
 * Extracts the link to request the item
 *  
 * @param html 
 * @returns 
 */
function extractRequestLink(html: string): string {
	// Look for the specific request button image and extract parent link
	const regex = /<a\s+[^>]*href="([^"]*)"[^>]*>\s*<img[^>]*src="[^"]*\/screens\/img\/botons\/request[^"]*"[^>]*>/i;
	const match = html.match(regex);

	return match ? decodeURIComponent(match[1]) : '';
}
function extractSignature(html: string): string {
	// First, try to find the items table
	const itemsTableMatch = html.match(/<table[^>]*class="bibItems"[^>]*>[\s\S]*?<\/table>/);

	if (!itemsTableMatch) {
		return ''; // No items table found
	}

	const itemsTable = itemsTableMatch[0];

	// Look for all signature cells (second column)
	const signatureCells = itemsTable.match(/<td[^>]*width="18%"[^>]*>[\s\S]*?<\/td>/g);

	if (signatureCells && signatureCells.length > 0) {
		// Get the first non-empty signature
		for (const cell of signatureCells) {
			const linkMatch = cell.match(/<a[^>]*>([^<]+)<\/a>/);
			if (linkMatch && linkMatch[1]) {
				const signature = decodeHtmlEntities(linkMatch[1].trim());
				if (signature) {
					return signature; // Return first valid signature
				}
			}
		}
	}

	return '';
}
/**
 * Extracts the link to the page that show all the libraries that have the item and its status
 * 
 * @param html 
 * @returns 
 */
function extractStatusLink(html: string): string | undefined {
	// find the form that contains name="volume" input
	const formMatch = html.match(/<form[^>]*>[\s\S]*?name="volume"[\s\S]*?<\/form>/);

	if (!formMatch) {
		return undefined;
	}
	const actionMatch = formMatch[0].match(/action="([^"]*)"/);

	return actionMatch ? decodeURIComponent(actionMatch[1]) : undefined;
}
/**
 * Extracts info from detail page
 * 
 * @param html 
 * @param language 
 * @returns 
 */
export function extractBookFromDetail(html: string, language: string = 'ca'): BookInfo {
	const fields = FIELDS[language];

	const title = extractByLabel(html, fields.title);
	const author = extractByLabel(html, fields.author);
	const publication = extractByLabel(html, fields.pub);
	const edition = extractByLabel(html, fields.edition);
	const description = extractByLabel(html, fields.description);
	const collection = extractByLabel(html, fields.collection);
	const summary = extractByLabel(html, fields.summary);
	const uniformTitle = extractByLabel(html, fields.uniformTitle);
	const isbn = extractByLabel(html, fields.isbn);
	const requestLink = extractRequestLink(html);
	const signature = extractSignature(html); // Add this line

	// Extract image URL
	const imgRegex = /src="(https?:\/\/portadesbd\.diba\.cat[^"]*)"/i;
	const imgMatch = html.match(imgRegex);

	let imageUrl;
	//If parameter i is void the content has no image
	if (imgMatch && imgMatch[1] && !imgMatch[1].includes('?i=&')){ 
		imageUrl = imgMatch[1].replace('&log=0&m=g', '');
	}
	
	const allStatusLink = extractStatusLink(html);

	let basicStatus:BookStatus[] = [];
	if(!allStatusLink){
		basicStatus = BookStatusParser.parse(html, language);
	}

	return {
		title: fixBookTitle(title),
		author,
		publication: cleanText(publication),
		edition,
		description: cleanText(description),
		collection: cleanText(collection),
		summary,
		uniformTitle,
		isbn: isbn ? parseInt(isbn) : undefined,
		imageUrl: imageUrl,
		requestLink,
		allStatusLink,
		signature,
		basicStatus
	};
}