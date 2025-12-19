export interface BookInfo {
	author: string;
	collection: string;
	edition: string;
	description: string;
	requestLink: string;
	publication: string;
	summary: string;
	title: string;
	uniformTitle: string;
	imageUrl: string;
	allStatusLink?: string;
	isbn?: number;
}
export interface BookStatus {
	location: string;
	locationLink: string;
	status: BookStatusType;
	notes?: string;
	signature?: string;
	statusText?: string;
}
export enum BookStatusType {
	Available = "available",
	Excluded = "excluded",
	OnLoan = "loan",
	Other = "other",
	WaitingForRetrieve = "waiting"
}
export interface BookListResults {
	totalResults: number,
	nextPage?: string,
	items: BookListItem[]
}
export interface BookListItem {
	title: string;
	imageUrl: string;
	detailLink: string;
	statuses: BookStatus[]; // Current availability from list view
	author?: string;
	year?: string;
}
export enum PageType {
	NoResults = "no-results",
	Detail = "detail",
	List = "list"
}
// Allow any string key (e.g., 'ca', 'en', 'es', 'fr', etc.)
export interface FieldTypes {
	[languageCode: string]: FieldLabels;
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
	pageType: {
		noResults: string,
		list: string
	},
	status: {
		available: string,
		excluded: string,
		onLoan: string,
		waitingForRetrieve: string
	}
}