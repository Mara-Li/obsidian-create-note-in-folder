import i18next from "i18next";
import {moment, Notice, Plugin, WorkspaceLeaf} from "obsidian";

import { ressources, translationLanguage } from "./i18n/i18next";
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

export default class NoteInFolder extends Plugin {
	settings: NoteInFolderSettings;
	
	/**
	 * A function to generate the filename using the template settings & filename settings
	 * @param folder {FolderSettings} - The folder settings
	 * @returns {string} - The generated filename
	 */
	generateFileName(folder: FolderSettings): string {
		let defaultName = folder.fileName;
		defaultName.replace(".md", "");
		const template = folder.template;
		const typeName = template.type;
		let generatedName = null;
		if (typeName === TemplateType.date) {
			if (template.format.trim().length === 0) {
				template.format = "YYYY-MM-DD";
			}
			generatedName = moment().format(template.format);
		} else if (typeName === TemplateType.folderName) {
			generatedName = folder.path.split("/").pop() ;
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
	
	/**
	 * For an unknow reason, the remove commands for a specific folderpath is not working
	 * This function check all the commands of the plugin and remove the ones that are not in the settings
	 * @returns {Promise<void>}
	 */
	async removeCommands()
	{
		//@ts-ignore
		const pluginCommands = Object.keys(this.app.commands.commands).filter((command) => command.startsWith("create-note-in-folder"));
		for (const command of pluginCommands) {
			//remove commands if the folder is not in the settings
			if (!this.settings.folder.some((folder) => folder.path === command.replace("create-note-in-folder:", ""))) {
				//@ts-ignore
				app.commands.removeCommand(command);
			}
		}
	}
	
	/**
	 * Adds or removes commands if the settings changed
	 * @param oldFolder {string | undefined} - the old folder path to remove the command
	 * @param newFolder {FolderSettings | undefined} - the new folder to add the command
	 */
	async addNewCommands(
		oldFolder: string | undefined,
		newFolder: FolderSettings | undefined,
	)
	{
		if (oldFolder !== undefined) {
			//@ts-ignore
			app.commands.removeCommand(`create-note-in-folder:${oldFolder}`); //doesn't work in some condition
		}
		if (newFolder !== undefined) {
			this.addCommand({
				id: `${newFolder.path}`,
				name: `${newFolder.path}`,
				callback: async () => {
					const defaultName = this.generateFileName(newFolder);
					//check if path exists
					if (!this.app.vault.getAbstractFileByPath(newFolder.path)) {
						new Notice(i18next.t("folderNotFound"));
						this.settings.folder = this.settings.folder.filter((folder) => folder !== newFolder);
						await this.addNewCommands(newFolder.path, undefined);
						await this.saveSettings();
						return;
					}
					console.log(i18next.t("log", {path: newFolder.path, name: defaultName}));
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
		i18next.init({
			lng: translationLanguage,
			fallbackLng: "en",
			resources: ressources,
			returnNull: false,
		});
		await this.loadSettings();
		if (this.settings.folder.length > 0 && typeof this.settings.folder[0] === "string") {
			const oldFolders = this.settings.folder as unknown as string[];
			this.settings.folder = [];
			for (const folder of oldFolders) {
				const defaultSettings = JSON.parse(JSON.stringify(DEFAULT_FOLDER_SETTINGS)); //for some reason, i need to make a deep copy of the default settings
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
					type:  folder.typeName === "string" ? TemplateType.none : folder.typeName,
					//@ts-ignore
					format: folder.formatName,
					position: Position.append,
					separator: "",
				};
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

