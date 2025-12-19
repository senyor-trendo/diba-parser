import { FieldTypes } from './parser.model';

export const FIELDS: FieldTypes = {
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
			list: '/screens/img/botons/save_to_my_lists'
		},
		status: {
			available: 'Disponible',
			excluded: 'Exclòs de préstec',
			onLoan: 'VENÇ',
			waitingForRetrieve: 'Prestatge reserva'
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
			list: '/screens/img/botons/save_to_my_lists'
		},
		status: {
			available: 'Available',
			excluded: 'Non-circulating',
			onLoan: 'DUE',
			waitingForRetrieve: 'On Hold Shelf'
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
			list: '/screens/img/botons/save_to_my_lists'
		},
		status: {
			available: 'Disponible',
			excluded: 'Excluido de préstamo',
			onLoan: 'VENCE',
			waitingForRetrieve: 'Estante reserva'
		}
	}
}