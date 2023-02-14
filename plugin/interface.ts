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

export enum TypeName {
	string = "string",
	date = "date",
	folderName = "folderName"
}

export interface FolderSettings {
	path: string;
	typeName: TypeName;
	formatName: string;
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


