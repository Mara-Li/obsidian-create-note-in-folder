import {moment, Notice, Plugin, WorkspaceLeaf} from "obsidian";
import {
	DEFAULT_SETTINGS,
	DefaultOpening,
	FolderSettings,
	NoteInFolderSettings,
	SplitDirection,
	TypeName
} from "./interface";
import {NoteInFolderSettingsTab} from "./settings";
import {t} from "./i18n";

export default class NoteInFolder extends Plugin {
	settings: NoteInFolderSettings;

	generateFileName(folder: FolderSettings): string {
		let defaultName = folder.formatName;
		defaultName.replace(".md", "");
		const typeName = folder.typeName;
		if (typeName === TypeName.date) {
			defaultName = moment().format(defaultName);
		}
		while (this.app.vault.getAbstractFileByPath(`${folder.path}/${defaultName}.md`)) {
			const increment = defaultName.match(/ \d+$/);
			const newIncrement = increment ? parseInt(increment[0]) + 1 : 1;
			defaultName = defaultName.replace(/ \d+$/, "") + " " + newIncrement;
		}
		return defaultName + ".md";
	}
	
	async addNewCommands(
		oldFolder: string | undefined,
		newFolder: FolderSettings | undefined,
	)
	{

		if (oldFolder !== undefined) {
			//@ts-ignore
			app.commands.removeCommand(`${this.manifest.id}:create-note-in-folder-${oldFolder.path}`);
		}
		if (newFolder !== undefined) {
			this.addCommand({
				id: `create-note-in-folder-${newFolder.path}`,
				name: `${newFolder.path}`,
				callback: async () => {
					const defaultName = this.generateFileName(newFolder);
					//check if path exists
					if (!this.app.vault.getAbstractFileByPath(newFolder.path)) {
						new Notice(t("folderNotFound") as string);
						this.settings.folder = this.settings.folder.filter((folder) => folder !== newFolder);
						await this.addNewCommands(newFolder.path, undefined);
						await this.saveSettings();
						return;
					}
					console.log("Creating note in path: " + newFolder.path + " with name: " + defaultName);
					const file = await this.app.vault.create(`${newFolder.path}/${defaultName}`, "");
					let leaf: WorkspaceLeaf;
					switch (newFolder.opening) {
						case DefaultOpening.split:
							leaf = this.app.workspace.getLeaf("split", newFolder.splitDefault);
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
					await leaf.openFile(file, {active: newFolder.focused});
				}
			});
		}
	}
	
	async onload() {
		console.log("Create Note in Folder plugin loaded");
		await this.loadSettings();
		
		//convert old settings (string[] to FolderSettings[])
		if (this.settings.folder.length > 0 && typeof this.settings.folder[0] === "string") {
			const oldFolders = this.settings.folder as unknown as string[];
			this.settings.folder = [];
			for (const folder of oldFolders) {
				this.settings.folder.push({
					path: folder,
					formatName: "Untitled",
					typeName: TypeName.string,
					opening: DefaultOpening.current,
					focused: true,
					splitDefault: SplitDirection.vertical});
			}
			await this.saveSettings();
		}
		
		this.addSettingTab(new NoteInFolderSettingsTab(this.app, this));
		const folders = this.settings.folder;
		for (const folder of folders) {
			await this.addNewCommands(undefined, folder);
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

