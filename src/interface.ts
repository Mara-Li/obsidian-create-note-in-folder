export enum DefaultOpening {
	NewTab = "newTab",
	Current = "current",
	Split = "split",
	NewWindow = "newWindow",
	Nothing = "nothing", //don't open the note at all! Useful for templates
}

export enum SplitDirection {
	Horizontal = "horizontal",
	Vertical = "vertical",
}

export enum TemplateType {
	Date = "date",
	FolderName = "folderName",
	None = "none",
}

export enum Position {
	Prepend = "prepend",
	Append = "append",
	None = "none",
}

export interface Template {
	type: TemplateType;
	format: string;
	position: Position;
	separator: string;
	increment?: boolean;
}

export interface FolderSettings {
	commandName: string;
	path: string;
	template: Template;
	fileName: string;
	opening: DefaultOpening;
	focused: boolean;
	splitDefault: SplitDirection;
	templater?: string;
	alreadyExistOpening: {
		opening: DefaultOpening;
		splitDefault: SplitDirection;
		focused: boolean;
	};
	fileMenu: boolean;
}

export interface CustomVariables {
	name: string;
	type: "string" | "date";
	value: string;
}

export type TimeoutTitle = {
	mobile: number;
	desktop: number;
};

export interface NoteInFolderSettings {
	folder: FolderSettings[];
	customVariables: CustomVariables[];
	enableAllFolder?: boolean;
	defaultTemplate?: FolderSettings;
	listAllFolderInModals?: boolean;
	filterAnyFolderCommand?: boolean;
	timeOutForInlineTitle?: TimeoutTitle | number;
}

export const DEFAULT_SETTINGS: NoteInFolderSettings = {
	folder: [],
	customVariables: [],
	timeOutForInlineTitle: 50,
};

export const DEFAULT_FOLDER_SETTINGS: FolderSettings = {
	path: "",
	commandName: "",
	template: {
		type: TemplateType.None,
		format: "",
		position: Position.Append,
		separator: "",
		increment: true,
	},
	fileName: "Untitled",
	opening: DefaultOpening.NewTab,
	focused: true,
	splitDefault: SplitDirection.Horizontal,
	alreadyExistOpening: {
		opening: DefaultOpening.NewTab,
		splitDefault: SplitDirection.Horizontal,
		focused: true,
	},
	fileMenu: false,
};
