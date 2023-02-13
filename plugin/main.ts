import {Plugin, WorkspaceLeaf, Notice} from "obsidian";
import {DEFAULT_SETTINGS, DefaultOpening, NoteInFolderSettings} from "./interface";
import {NoteInFolderSettingsTab} from "./settings";
import {t} from "./i18n";

export default class NoteInFolder extends Plugin {
	settings: NoteInFolderSettings;

	addNewCommands(
		oldFolder: string | undefined,
		newFolder: string | undefined,
	)
	{

		if (oldFolder !== undefined) {
			//@ts-ignore
			app.commands.removeCommand(`${this.manifest.id}:create-note-in-folder-${oldFolder}`);
		}
		if (newFolder !== undefined) {
			this.addCommand({
				id: `create-note-in-folder-${newFolder}`,
				name: `${newFolder}`,
				callback: async () => {
					const defaultName = this.settings.defaultName;
					console.log("Creating note in folder: " + newFolder + " with name: " + defaultName + ".md");
					//check if folder exists
					if (!this.app.vault.getAbstractFileByPath(newFolder)) {
						new Notice(t("folderNotFound") as string);
						this.settings.folder = this.settings.folder.filter((folder) => folder !== newFolder);
						this.addNewCommands(newFolder, undefined);
						this.saveSettings();
						return;
					}
					const file = await this.app.vault.create(`${newFolder}/${defaultName}.md`, "");
					let leaf: WorkspaceLeaf;
					switch (this.settings.opening) {
						case DefaultOpening.split:
							leaf = this.app.workspace.getLeaf("split", this.settings.splitDefault);
							break;
						case DefaultOpening.newWindow:
							leaf = this.app.workspace.getLeaf("window");
							break;
						case DefaultOpening.newTab:
							leaf = this.app.workspace.getLeaf(true);
							break;
						default:
							leaf = this.app.workspace.getLeaf(false);
							break;
					}
					await leaf.openFile(file, {active: this.settings.focused});
				}
			});
		}
	}
	
	async onload() {
		console.log("Create Note in Folder plugin loaded");
		await this.loadSettings();
		
		this.addSettingTab(new NoteInFolderSettingsTab(this.app, this));
		const folders = this.settings.folder;
		for (const folder of folders) {
			this.addNewCommands(undefined, folder);
		}
	}

	onunload() {
		console.log("Create Note in Folder plugin unloaded");
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

