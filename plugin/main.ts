import {moment, Notice, Plugin, WorkspaceLeaf} from "obsidian";
import {
	DEFAULT_FOLDER_SETTINGS,
	DEFAULT_SETTINGS,
	DefaultOpening,
	FolderSettings,
	NoteInFolderSettings,
	Position,
	TemplateType
} from "./interface";
import {NoteInFolderSettingsTab} from "./settings";
import {t} from "./i18n";

export default class NoteInFolder extends Plugin {
	settings: NoteInFolderSettings;

	generateFileName(folder: FolderSettings): string {
		let defaultName = folder.fileName;
		defaultName.replace(".md", "");
		const template = folder.template;
		const typeName = template.type;
		let generatedName = null;
		if (typeName === TemplateType.date) {
			generatedName = moment().format(template.format);
		} else if (typeName === TemplateType.folderName) {
			generatedName = folder.path.split("/").pop() as string;
		}
		if (template.position === Position.prepend && generatedName) {
			defaultName = generatedName + template.separator + defaultName;
		} else if (template.position === Position.append && generatedName) {
			defaultName = defaultName + template.separator + generatedName;
		}
		while (this.app.vault.getAbstractFileByPath(`${folder.path}/${defaultName}.md`)) {
			const increment = defaultName.match(/ \d+$/);
			const newIncrement = increment ? parseInt(increment[0]) + 1 : 1;
			defaultName = defaultName.replace(/ \d+$/, "") + " " + newIncrement;
		}
		return defaultName + ".md";
	}
	
	async removeCommands()
	{
		//@ts-ignore
		const pluginCommands = Object.keys(this.app.commands.commands).filter((command) => command.startsWith("create-note-in-folder:create-note-in-folder"));
		for (const command of pluginCommands) {
			//remove commands if the folder is not in the settings
			if (!this.settings.folder.some((folder) => folder.path === command.replace("create-note-in-folder:create-note-in-folder-", ""))) {
				//@ts-ignore
				app.commands.removeCommand(command);
			}
		}
	}
	
	async addNewCommands(
		oldFolder: string | undefined,
		newFolder: FolderSettings | undefined,
	)
	{
		console.log("Old folder: ", oldFolder);
		if (oldFolder !== undefined) {
			//@ts-ignore
			app.commands.removeCommand(`create-note-in-folder:create-note-in-folder-${oldFolder}`);
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
		console.log(typeof this.settings.folder[0]);
		if (this.settings.folder.length > 0 && typeof this.settings.folder[0] === "string") {
			const oldFolders = this.settings.folder as unknown as string[];
			this.settings.folder = [];
			for (const folder of oldFolders) {
				//create a copy of the default settings
				const defaultSettings = JSON.parse(JSON.stringify(DEFAULT_FOLDER_SETTINGS));
				defaultSettings.path = folder;
				this.settings.folder.push(defaultSettings);
			}
			await this.saveSettings();
		}
		
		//check of old settings are still valid
		for (const folder of this.settings.folder) {
			//check if template is in folderSettings
			if (!Object.values(folder).includes(folder.template)) {
				//@ts-ignore
				folder.fileName = folder.formatName;
				folder.template = {
					//@ts-ignore
					type: folder.typeName as TemplateType,
					//@ts-ignore
					format: folder.formatName,
					position: Position.append,
					separator: " ",
				};
				//delete old settings
				//@ts-ignore
				delete folder.TypeName;
				//@ts-ignore
				delete folder.formatName;
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

