import { FIELDS } from "./parser.config";
import { PageType } from "./parser.model";

// Helper function to decode HTML entities
export function decodeHtmlEntities(text: string): string {
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
export function cleanText(text: string): string {
  return text
    .replace(/\s*:\s*/g, ': ')
    .replace(/\s*;\s*/g, '; ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
export function fixBookTitle(title: string): string {
	const lastIndexOfSlash = title.lastIndexOf('/');

	if (lastIndexOfSlash !== -1) {
		title = title.substring(0, lastIndexOfSlash);
	}

	return cleanText(title);
}
// Helper function to clean HTML tags from text
export function stripHtmlTags(text: string): string {
	return text.replace(/<[^>]*>/g, '');
}

export function checkPageType(html: string, language: string): PageType {
	if (html.indexOf(FIELDS[language].pageType.noResults) !== -1) {
		return PageType.NoResults;
	}
	else if (html.indexOf(FIELDS[language].pageType.list) !== -1) {
		return PageType.List;
	}

	return PageType.Detail;
}