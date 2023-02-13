import {Plugin, WorkspaceLeaf} from "obsidian";
import {DEFAULT_SETTINGS, DefaultOpening, NoteInFolderSettings} from "./interface";
import {NoteInFolderSettingsTab} from "./settings";

export default class NoteInFolder extends Plugin {
	settings: NoteInFolderSettings;

	async onload() {
		console.log("Create Note in Folder plugin loaded");
		await this.loadSettings();
		
		this.addSettingTab(new NoteInFolderSettingsTab(this.app, this));
		const folders = this.settings.folder;
		for (const folder of folders) {
			this.addCommand({
				id: `create-note-in-folder-${folder}`,
				name: `${folder}`,
				callback: async () => {
					const defaultName = this.settings.defaultName;
					console.log("Creating note in folder: " + folder + " with name: " + defaultName + ".md");
					const file = await this.app.vault.create(`${folder}/${defaultName}.md`, "");
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

