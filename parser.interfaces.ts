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

export enum PageType{
	NoResults = "no-results", 
	Detail = "detail", 
	List = "list"
}
interface FieldLabels {
    author: string;
    collection: string;
    description: string;
    edition: string;
    isbn: string;
    pub: string;
    summary: string;
    title: string;
    uniformTitle: string;
	pageType:{
		noResults: string,
		list: string
	}
}

// Allow any string key (e.g., 'ca', 'en', 'es', 'fr', etc.)
export interface FieldTypes {
    [languageCode: string]: FieldLabels;
}

export const FIELDS:FieldTypes = {
	ca: {
		author: 'Autor/Artista',
		collection: 'Col&middot;lecci&oacute;',
		description: 'Descripci&oacute;',
		edition: 'Edici&oacute;',
		isbn: 'ISBN',
		pub: 'Publicació',
		summary: 'Sinopsi',
		title: 'Títol',
		uniformTitle: 'Títol uniforme',
		pageType:{
			noResults: 'NO HI HA RESULTATS',
			list: 'Ordenat per'
		}
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
		uniformTitle: 'Uniform title',
		pageType:{
			noResults: 'NO ENTRIES FOUND',
			list: 'Sorted by'
		}
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
		uniformTitle: 'Título uniforme',
		pageType:{
			noResults: 'NO HAY RESULTADOS',
			list: 'Ordenado por'
		}
	}
}