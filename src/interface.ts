export enum DefaultOpening {
	newTab = "newTab",
	current = "current",
	split = "split",
	newWindow = "newWindow"
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

export interface FolderSettings {
	commandName: string;
	path: string;
	template: {
		type: TemplateType;
		format: string;
		position: Position;
		separator: string;
		increment?: boolean;
	};
	fileName: string;
	opening: DefaultOpening;
	focused: boolean;
	splitDefault: SplitDirection;
	
}


export interface CustomVariables {
	name: string,
	type: "string" | "date"
	value: string
}

export interface NoteInFolderSettings {
	folder: FolderSettings[];
	customVariables: CustomVariables[];
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
