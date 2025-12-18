import { decodeHtmlEntities, fixBookCollection, fixBookTitle, stripHtmlTags } from "./parser-utils";
import { FIELDS } from "./parser.config";
import { BookInfo } from "./parser.model";

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
function extractRequestLink(html: string): string {
  // Look for the specific request button image and extract parent link
  const regex = /<a\s+[^>]*href="([^"]*)"[^>]*>\s*<img[^>]*src="[^"]*\/screens\/img\/botons\/request[^"]*"[^>]*>/i;
  const match = html.match(regex);
  
  return match ? decodeURIComponent(match[1]) : '';
}

// Main function to extract book info
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

	// Extract image URL
	let imageUrl = '';
	const imgRegex = /<img[^>]*id="fitxa_imatge"[^>]*src="([^"]*)"[^>]*>/i;
	const imgMatch = html.match(imgRegex);
	if (imgMatch && imgMatch[1]) {
		imageUrl = imgMatch[1];
	} else {
		// Fallback: look for any img with portadesbd.diba.cat
		const fallbackRegex = /src="(https?:\/\/portadesbd\.diba\.cat[^"]*)"/i;
		const fallbackMatch = html.match(fallbackRegex);
		if (fallbackMatch && fallbackMatch[1]) {
			imageUrl = fallbackMatch[1];
		}
	}

	// Extract permanent link
	let permanentLink = '';
	const linkRegex = /<a[^>]*id="recordnum"[^>]*href="([^"]*)"[^>]*>/i;
	const linkMatch = html.match(linkRegex);
	if (linkMatch && linkMatch[1]) {
		permanentLink = linkMatch[1];
	}

	return {
		title: fixBookTitle(title),
		author,
		publication,
		edition,
		description,
		collection: fixBookCollection(collection),
		summary,
		uniformTitle,
		isbn: isbn? parseInt(isbn) : undefined,
		imageUrl,
		requestLink
	};
}