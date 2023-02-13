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

export interface NoteInFolderSettings {
	folder: string[];
	defaultName: string;
	opening: DefaultOpening;
	focused: boolean;
	splitDefault: SplitDirection;
}

export const DEFAULT_SETTINGS: NoteInFolderSettings = {
	folder: [],
	defaultName: "Untitled",
	opening: DefaultOpening.newTab,
	focused: true,
	splitDefault: SplitDirection.horizontal
};


