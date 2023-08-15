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
	path: string;
	template: {
		type: TemplateType;
		format: string;
		position: Position;
		separator: string;
	};
	fileName: string;
	opening: DefaultOpening;
	focused: boolean;
	splitDefault: SplitDirection;
	
}

export interface NoteInFolderSettings {
	folder: FolderSettings[];
}

export const DEFAULT_SETTINGS: NoteInFolderSettings = {
	folder: [],
};

export const DEFAULT_FOLDER_SETTINGS: FolderSettings = {
	path: "",
	template: {
		type: TemplateType.none,
		format: "",
		position: Position.append,
		separator: "",
	},
	fileName: "Untitled",
	opening: DefaultOpening.newTab,
	focused: true,
	splitDefault: SplitDirection.horizontal,
};
