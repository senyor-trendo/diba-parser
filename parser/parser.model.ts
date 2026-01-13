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
	signature?: string;
	basicStatus?: BookStatus[];
}
export interface BookStatus {
	libId: string;
	status: BookStatusType;
	notes?: string;
	statusText?: string;
}
export enum BookStatusType {
	Available = 1,
	OnLoan = 2,
	Excluded = 3,
	WaitingForRetrieve = 4,
	Other = 9
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
	List = "list",
	Status = "status"
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
		detail: string,
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