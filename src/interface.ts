export enum DefaultOpening {
	newTab = "newTab",
	current = "current",
	split = "split",
	newWindow = "newWindow",
	nothing = "nothing" //don't open the note at all! Useful for templates
}

export enum SplitDirection {
	horizontal = "horizontal",
	vertical = "vertical"
}

export enum TemplateType {
	date = "date",
	folderName = "folderName",
	none = "none"
}

export enum Position {
	prepend = "prepend",
	append = "append",
	none = "none"
}

export interface Template {
	type: TemplateType;
	format: string;
	position: Position;
	separator: string;
	increment ?: boolean;
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
}


export interface CustomVariables {
	name: string,
	type: "string" | "date"
	value: string
}

export interface NoteInFolderSettings {
	folder: FolderSettings[];
	customVariables: CustomVariables[];
	enableAllFolder?: boolean;
	defaultTemplate?: FolderSettings;
	listAllFolderInModals?: boolean;
	filterAnyFolderCommand?: boolean;
}

export const DEFAULT_SETTINGS: NoteInFolderSettings = {
	folder: [],
	customVariables: [],
};

export const DEFAULT_FOLDER_SETTINGS: FolderSettings = {
	path: "",
	commandName: "",
	template: {
		type: TemplateType.none,
		format: "",
		position: Position.append,
		separator: "",
		increment: true,
	},
	fileName: "Untitled",
	opening: DefaultOpening.newTab,
	focused: true,
	splitDefault: SplitDirection.horizontal,
};
