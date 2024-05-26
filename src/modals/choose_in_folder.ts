import { type App, FuzzySuggestModal, type TFile, TFolder } from "obsidian";
import { DEFAULT_FOLDER_SETTINGS, type FolderSettings } from "src/interface";
import type NoteInFolder from "src/main";
import { createFolderInCurrent, createNoteInFolder } from "src/utils/create_note";

function specialSortCurrentRoot(template: FolderSettings[]) {
	return template.sort((a, b) => {
		if (a.commandName === "/") return -1;
		if (b.commandName === "/") return 1;
		if (a.commandName === "{{current}}") return -1;
		if (b.commandName === "{{current}}") return 1;
		return a.commandName.localeCompare(b.commandName);
	});
}

export class ChooseFolder extends FuzzySuggestModal<FolderSettings> {
	currentFile?: TFile;
	plugin: NoteInFolder;

	constructor(app: App, plugin: NoteInFolder, currentFile?: TFile) {
		super(app);
		this.plugin = plugin;
		this.currentFile = currentFile;
	}

	getItems(): FolderSettings[] {
		const allFoldersSettings = JSON.parse(
			JSON.stringify(this.plugin.settings.folder)
		) as FolderSettings[];
		if (this.plugin.settings.enableAllFolder) {
			//add a sort of placeholder to open the other modals on selection

			if (!this.plugin.settings.listAllFolderInModals)
				allFoldersSettings.push({
					...DEFAULT_FOLDER_SETTINGS,
					path: "",
					commandName: "Other folders...",
				});
			else {
				/** add placeholder for css */
				allFoldersSettings.push({
					...DEFAULT_FOLDER_SETTINGS,
					path: "",
					commandName: "-------",
				});

				const allFolders = this.app.vault
					.getAllLoadedFiles()
					.filter((file) => file instanceof TFolder);
				allFolders.push(this.app.vault.getRoot());
				//create object with adding the default template to the folder
				const toPush = allFolders
					.map((folder) => {
						const defaultTemplate =
							this.plugin.settings.defaultTemplate ?? DEFAULT_FOLDER_SETTINGS;
						return {
							...defaultTemplate,
							path: folder.path,
							commandName: folder.path,
						};
					})
					.filter(
						(folder) =>
							!this.plugin.settings.folder.some(
								(folderSettings) => folderSettings.path === folder.path
							)
					)
					.sort((a, b) => a.path.localeCompare(b.path));
				allFoldersSettings.push(...toPush);
			}
		}
		if (!this.currentFile) {
			return allFoldersSettings.filter((folder) => !folder.path.contains("{{current}}"));
		}

		return allFoldersSettings;
	}
	getItemText(item: FolderSettings): string {
		if (
			(this.plugin.settings.listAllFolderInModals && item.commandName === "-------") ||
			item.path === "-------"
		) {
			const promptResult = this.resultContainerEl.querySelectorAll(".suggestion-item");
			const lastElement = promptResult[promptResult.length - 1];
			if (lastElement) {
				//remove item name
				item.commandName = "";
				//add css
				lastElement.classList.add("hr-item");
				lastElement.createEl("hr");
				item.path = "-------";
			}
		}
		return item.commandName;
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async onChooseItem(
		item: FolderSettings,
		_evt: MouseEvent | KeyboardEvent
	): Promise<void> {
		if (
			this.plugin.settings.enableAllFolder &&
			item.commandName === "Other folders..." &&
			item.path === ""
		) {
			new ChooseInAllFolder(this.app, this.plugin, true, this.currentFile).open();
			return;
		} else if (
			this.currentFile &&
			item.path.contains("{{current}}") &&
			item.commandName !== "" &&
			item.path !== ""
		) {
			createFolderInCurrent(item, this.currentFile, this.plugin);
		} else if (item.commandName !== "" && item.path !== "") {
			await createNoteInFolder(item, this.plugin);
		} else if (this.plugin.settings.listAllFolderInModals) {
			//TODO: FOUND ANOTHER WAY TO DO THIS
			new ChooseFolder(this.app, this.plugin, this.currentFile).open();
		}
	}
}

export class ChooseInAllFolder extends FuzzySuggestModal<FolderSettings> {
	plugin: NoteInFolder;
	filter: boolean;
	currentFile?: TFile;

	constructor(app: App, plugin: NoteInFolder, filter = true, currentFile?: TFile) {
		super(app);
		this.filter = filter;
		this.plugin = plugin;
		this.currentFile = currentFile;
	}

	getItems(): FolderSettings[] {
		//list all folder of the Obsidian vault and filter them to keep only the one unregister
		const allFolders = this.app.vault
			.getAllLoadedFiles()
			.filter((file) => file instanceof TFolder);
		allFolders.push(this.app.vault.getRoot());
		//create object with adding the default template to the folder
		let templatedFolders: FolderSettings[] = allFolders
			.map((folder) => {
				const defaultTemplate =
					this.plugin.settings.defaultTemplate ?? DEFAULT_FOLDER_SETTINGS;
				return {
					...defaultTemplate,
					path: folder.path,
					commandName: folder.path,
				};
			})
			.filter(
				(folder) =>
					!this.plugin.settings.folder.some(
						(folderSettings) => folderSettings.path === folder.path
					)
			);
		if (this.currentFile) {
			const currentFolder = this.currentFile.parent?.path ?? "/";
			//remove current folder from the list
			templatedFolders = templatedFolders.filter(
				(folder) => folder.path !== currentFolder
			);
			const userDefinedFolder = this.plugin.settings.folder.find((folder) => {
				return folder.path.replace("{{current}}", currentFolder) === currentFolder;
			});
			if (!this.filter && userDefinedFolder) {
				//search in the user defined list & add it to the list
				templatedFolders.push({
					...userDefinedFolder,
					commandName: "{{current}}",
				});
			} else if (!userDefinedFolder) {
				//add the default template with current only if the user didn't define it
				//add the current folder to the list
				templatedFolders.push({
					...DEFAULT_FOLDER_SETTINGS,
					path: currentFolder,
					commandName: "{{current}}",
				});
			}
		}

		if (this.filter) return specialSortCurrentRoot(templatedFolders);

		let allFoldersSettings = JSON.parse(
			JSON.stringify(this.plugin.settings.folder)
		) as FolderSettings[];
		//remove the {{current}} path from the list
		allFoldersSettings = allFoldersSettings.filter(
			(folder) => !folder.path.contains("{{current}}")
		);
		templatedFolders = templatedFolders.concat(
			allFoldersSettings.map((folder) => {
				return {
					...folder,
					commandName: folder.path,
					path: folder.path,
				};
			})
		);
		return specialSortCurrentRoot(templatedFolders);
	}
	getItemText(item: FolderSettings): string {
		return item.commandName;
	}

	async onChooseItem(
		item: FolderSettings,
		_evt: MouseEvent | KeyboardEvent
	): Promise<void> {
		if (this.currentFile && item.path.contains("{{current}}"))
			createFolderInCurrent(item, this.currentFile, this.plugin);
		else await createNoteInFolder(item, this.plugin);
	}
}
