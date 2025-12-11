# HTML Book Parser

A TypeScript-based parser for extracting book information and library statuses from HTML pages of the Diputació de Barcelona library catalog.

## Features

- Extracts book metadata (title, author, ISBN, publication details, etc.)
- Extracts library availability and status information
- Supports multiple languages (Catalan, Spanish, English)
- Batch processing of multiple files
- Outputs clean JSON files

## Installation

1. **Clone or download the repository**

2. **Install dependencies:**
```bash
npm install
```

## Usage

### 1. Prepare Your HTML Files
Place your HTML content in text files inside the `html/` folder.
Files must follow this naming convention:
`[filename].[language].txt`

**Supported language codes:**
- `ca` - Catalan
- `es` - Spanish
- `en` - English

**Examples:**
- `supergatet.ca.txt` - Catalan version
- `supergatet.es.txt` - Spanish version
- `supergatet.en.txt` - English version

---

### 2. Run the Parser

### Process all files in the `html` folder:
```bash
npm run parse
```

