// index.ts
import fs from 'fs';
import path from 'path';
import { PageType } from './parser/parser.model';
import { checkPageType } from './parser/parser-utils';
import { extractBooksFromList } from './parser/list-parser';
import { extractBookFromDetail } from './parser/detail-parser';
import BookStatusParser from './parser/book-status-parser';

interface ProcessingOptions {
	inputDir: string;
	outputDir: string;
	languages: string[];
}

// Function to process a single HTML file
function processHtmlFile(filePath: string, language: string, outputDir: string): void {
	const currentTime = Date.now();
	try {
		// Read the HTML content from the file
		const html = fs.readFileSync(filePath, 'utf-8');
		const baseName = path.basename(filePath, '.txt'); // Get the base filename without extension
		const pageType = checkPageType(html, language);

		switch (pageType) {
			case PageType.NoResults:
				console.log(`✓ Processed: ${path.basename(filePath)}`);
				console.log(`No results page`);
				console.log(`- No file created`);
				break;

			case PageType.List:
				const bookList = extractBooksFromList(html);
				const bookListFile = path.join(outputDir, `${baseName}.book-list.json`);

				fs.writeFileSync(bookListFile, JSON.stringify(bookList, null, 2), 'utf-8');

				console.log(`✓ Processed: ${path.basename(filePath)}`);
				console.log(`List page`);
				console.log(`  - Book info saved to: ${path.basename(bookListFile)}`);
				console.log(`  - Found ${bookList.totalResults} library entries`);

				break;

			case PageType.Detail:
				const bookInfo = extractBookFromDetail(html, language);
				const bookStatus = BookStatusParser.parse(html, language);

				// Create output filenames
				const bookResultsFile = path.join(outputDir, `${baseName}.book-results.json`);
				const bookStatusFile = path.join(outputDir, `${baseName}.book-status.json`);

				// Save results to files
				fs.writeFileSync(bookResultsFile, JSON.stringify(bookInfo, null, 2), 'utf-8');
				fs.writeFileSync(bookStatusFile, JSON.stringify(bookStatus, null, 2), 'utf-8');

				console.log(`✓ Processed: ${path.basename(filePath)}`);
				console.log(`Detail page`);
				console.log(`  - Book info saved to: ${path.basename(bookResultsFile)}`);
				console.log(`  - Library status saved to: ${path.basename(bookStatusFile)}`);
				console.log(`  - Found ${bookStatus.length} library entries`);
				break;
		}

		console.log(`${(Date.now() - currentTime)/1000*60}s`)
	}
	catch (error) {
		console.error(`✗ Error processing ${filePath}:`, error);
	}
}

// Function to find all HTML files in a directory
function findHtmlFiles(inputDir: string, languages: string[]): { filePath: string; language: string }[] {
	const files: { filePath: string; language: string }[] = [];

	try {
		// Read all files in the directory
		const allFiles = fs.readdirSync(inputDir);

		// Filter for .txt files with language suffixes
		allFiles.forEach(filename => {
			// Check if it's a .txt file
			if (filename.endsWith('.txt')) {
				// Extract the language code from the filename
				// Pattern: something.ca.txt, something.es.txt, something.en.txt
				const nameWithoutExt = filename.slice(0, -4); // Remove .txt
				const lastDotIndex = nameWithoutExt.lastIndexOf('.');

				if (lastDotIndex !== -1) {
					const potentialLang = nameWithoutExt.substring(lastDotIndex + 1);

					// Check if this is a valid language code
					if (languages.includes(potentialLang)) {
						const filePath = path.join(inputDir, filename);
						files.push({
							filePath,
							language: potentialLang
						});
					}
				}
			}
		});

	} catch (error) {
		console.error(`✗ Error reading directory ${inputDir}:`, error);
	}

	return files;
}

// Main function to process all files
function main(options: ProcessingOptions = {
	inputDir: path.join(__dirname, 'html'),
	outputDir: path.join(__dirname, 'dist'),
	languages: ['ca', 'es', 'en']
}): void {
	try {
		const { inputDir, outputDir, languages } = options;

		console.log('Starting HTML parser...');
		console.log(`Input directory: ${inputDir}`);
		console.log(`Output directory: ${outputDir}`);
		console.log(`Languages to process: ${languages.join(', ')}`);
		console.log('---\n');

		// Check if input directory exists
		if (!fs.existsSync(inputDir)) {
			console.error(`✗ Input directory not found: ${inputDir}`);
			console.log('Creating html directory...');
			fs.mkdirSync(inputDir, { recursive: true });
			console.log(`Please place your .txt files (e.g., "filename.ca.txt") in the ${inputDir} folder`);
			return;
		}

		// Create output directory if it doesn't exist
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
			console.log(`Created output directory: ${outputDir}`);
		}

		// Find all HTML files to process
		const filesToProcess = findHtmlFiles(inputDir, languages);

		if (filesToProcess.length === 0) {
			console.log('No .txt files with language suffixes found.');
			console.log('Expected filenames: name.ca.txt, name.es.txt, name.en.txt');
			console.log(`Please place files in: ${inputDir}`);
			return;
		}

		console.log(`Found ${filesToProcess.length} file(s) to process:\n`);

		// Process each file
		filesToProcess.forEach((file, index) => {
			console.log(`[${index + 1}/${filesToProcess.length}] Processing: ${path.basename(file.filePath)} (${file.language})`);
			processHtmlFile(file.filePath, file.language as 'ca' | 'es' | 'en', outputDir);
			console.log(); // Empty line between files
		});

		// Summary
		console.log('---');
		console.log('Processing complete!');
		console.log(`Processed ${filesToProcess.length} file(s)`);
		console.log(`Results saved to: ${outputDir}`);

	} catch (error) {
		console.error('✗ Unexpected error:', error);
		process.exit(1);
	}
}

// Alternative: Process single file from command line
function processSingleFile() {
	const args = process.argv.slice(2);

	if (args.length === 1) {
		// Single file mode
		const filePath = args[0];
		const language = 'ca'; // Default language

		if (!fs.existsSync(filePath)) {
			console.error(`File not found: ${filePath}`);
			return;
		}

		const outputDir = path.join(__dirname, 'dist');
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}

		console.log(`Processing single file: ${filePath}`);
		processHtmlFile(filePath, language, outputDir);

	} else {
		// Batch mode - process all files in html folder
		main();
	}
}

// Run the program
if (require.main === module) {
	processSingleFile();
}

// Export for testing or programmatic use
export { processHtmlFile, findHtmlFiles, main };