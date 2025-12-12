import { decodeHtmlEntities, stripHtmlTags } from "./parser-utils";
import { BookListItem } from "./parser.model";
import { extractBookStatus } from "./status-parser";

// Function to extract books from a list results page
export function extractBooksFromList(html: string): BookListItem[] {
   const books: BookListItem[] = [];
    
    // First, let's find all the briefCitRow sections
    // They have a specific pattern with briefcitEntryNum, briefcitMedia, etc.
    
    // Look for the start of each book entry
    let currentIndex = 0;
    
    while (true) {
        // Find the next briefcitEntryNum div which marks the start of a book
        const entryStart = html.indexOf('<div class="briefcitEntryNum">', currentIndex);
        if (entryStart === -1) break;
        
        // Find the end of this book entry (look for the next entry or a clear marker)
        let entryEnd = html.indexOf('<div class="briefcitEntryNum">', entryStart + 1);
        if (entryEnd === -1) {
            // If no next entry, go to the end of the container
            entryEnd = html.indexOf('<!-- Fi briefcit_cat -->', entryStart);
            if (entryEnd === -1) {
                // Last resort: look for the next hr tag
                entryEnd = html.indexOf('<hr />', entryStart);
                if (entryEnd === -1) {
                    entryEnd = html.length;
                }
            }
        }
        
        const bookHtml = html.substring(entryStart, entryEnd);
        
        // Extract title and link
        let title = '';
        let detailLink = '';
        
        // Try multiple patterns for the title link
        const titlePatterns = [
            /<span class="titular">\s*<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i,
            /<a[^>]*href="([^"]*)"[^>]*class="[^"]*"[^>]*>([\s\S]*?)<\/a>\s*<a[^>]*href/i,
            /<a[^>]*href="([^"]*)"[^>]*>([^<]+)<span class="fullRecordStyle">/i
        ];
        
        for (const pattern of titlePatterns) {
            const titleMatch = bookHtml.match(pattern);
            if (titleMatch) {
                detailLink = titleMatch[1];
                title = decodeHtmlEntities(stripHtmlTags(titleMatch[2])).trim();
                title = title.replace(/\s*\+ info\s*$/, '');
                break;
            }
        }
        
        // If still no title, try a simpler approach
        if (!title) {
            const simplerPattern = /<a[^>]*href="([^"]*\/frameset[^"]*)"[^>]*>([^<]+)<\/a>/i;
            const simplerMatch = bookHtml.match(simplerPattern);
            if (simplerMatch) {
                detailLink = simplerMatch[1];
                title = decodeHtmlEntities(stripHtmlTags(simplerMatch[2])).trim();
            }
        }
        
        // Extract image URL
        let imageUrl = '';
        const imgPattern = /<img[^>]*src="([^"]*portadesbd[^"]*)"[^>]*>/i;
        const imgMatch = bookHtml.match(imgPattern);
        if (imgMatch && imgMatch[1]) {
            imageUrl = imgMatch[1];
        } else {
            // Try alternative pattern
            const altImgPattern = /<div class="brief_portada">[^<]*<img[^>]*src="([^"]*)"[^>]*>/i;
            const altImgMatch = bookHtml.match(altImgPattern);
            if (altImgMatch && altImgMatch[1]) {
                imageUrl = altImgMatch[1];
            }
        }
        
        // Extract author - look for text after <br /> tags
        let author = '';
        // Pattern for author line (looks like: Les Schtroumpfs et les enfants perdus. Català<br />)
        const authorLinePattern = /<br \/>\s*([^<]+?)\s*<br \/>/i;
        const authorLineMatch = bookHtml.match(authorLinePattern);
        if (authorLineMatch && authorLineMatch[1]) {
            author = decodeHtmlEntities(authorLineMatch[1].trim());
        }
        
        // Alternative author pattern: look for author name after the title
        if (!author) {
            const altAuthorPattern = /<br \/>\s*([A-Z][a-z]+,\s*[A-Z][a-z]+(\s*[A-Z][a-z]+)?)\s*<br \/>/i;
            const altAuthorMatch = bookHtml.match(altAuthorPattern);
            if (altAuthorMatch && altAuthorMatch[1]) {
                author = decodeHtmlEntities(altAuthorMatch[1].trim());
            }
        }
        
        // Extract year from publication info
        let year = '';
        const yearPattern = /(\d{4})<\/div>/;
        const yearMatch = bookHtml.match(yearPattern);
        if (yearMatch && yearMatch[1]) {
            year = yearMatch[1];
        }
        
        // Extract availability statuses
        const statuses = extractBookStatus(bookHtml);
        
        // Only add book if we have at least a title
        if (title) {
            books.push({
                title,
                imageUrl,
                detailLink: detailLink || '',
                statuses,
                author: author || undefined,
                year: year || undefined
            });
        }
        
        currentIndex = entryEnd;
    }
    
    return books;
}