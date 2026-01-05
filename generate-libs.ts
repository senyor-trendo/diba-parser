// index.ts
import fs from 'fs';
import path from 'path';
import { BookStatus } from './parser/parser.model';

interface ProcessingOptions {
	outputDir: string;
}

// Function to process a single HTML file
function generateLibsFromBooksStatus(filePath: string, outputDir: string): void {
	const statusList: BookStatus[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
	const nameId: any = {};
	const idName: any = {};
	const uniqueLibs = new Set<string>();

	statusList.forEach(status => uniqueLibs.add(status.location));

	let id = 10;
	[...uniqueLibs]
		.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
		.forEach(libName => {
			nameId[libName] = id;
			idName[id] = libName;
			id += 10;
		});

	fs.writeFileSync(path.join(outputDir, `libaries.name-id.json`), JSON.stringify(nameId, null, 2), 'utf-8');
	fs.writeFileSync(path.join(outputDir, `libaries.id-name.json`), JSON.stringify(idName, null, 2), 'utf-8');
}

function processFile() {
	const args = process.argv.slice(2);

	if (args.length === 1) {
		// Single file mode
		const filePath = args[0];

		if (!fs.existsSync(filePath)) {
			console.error(`File not found: ${filePath}`);
			return;
		}
		const outputDir = path.join(__dirname, 'dist');
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}

		generateLibsFromBooksStatus(filePath, outputDir);
	}
	else {
		console.warn('Please provide a file argument to process. i.e. npm run generate-libs dist\status.json')
	}
}

// Run the program
if (require.main === module) {
	processFile();
}
