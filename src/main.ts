import i18next from "i18next";
import { Notice, Plugin, TFile } from "obsidian";

import { ressources, translationLanguage } from "./i18n/i18next";
import {
	DEFAULT_FOLDER_SETTINGS,
	DEFAULT_SETTINGS,
	FolderSettings,
	NoteInFolderSettings,
	Position,
	TemplateType
} from "./interface";
import { ChooseFolder, ChooseInAllFolder } from "./modals/choose_in_folder";
import { NoteInFolderSettingsTab } from "./settings";
import { createFolderInCurrent, createNoteInFolder } from "./utils/create_note";

export default class NoteInFolder extends Plugin {
	settings: NoteInFolderSettings;

	/**
	 * For an unknown reason, the remove commands for a specific folder-path is not working
	 * This function check all the commands of the plugin and remove the ones that are not in the settings
	 * @returns {Promise<void>}
	 */
	async removeCommands(): Promise<void> {
		//@ts-ignore
		let pluginCommands = Object.keys(this.app.commands.commands).filter((command) => command.startsWith("create-note-in-folder"));
		//remove quickswitcher command
		pluginCommands = pluginCommands.filter((command) => !command.replace("create-note-in-folder:", "").contains("quickSwitcher-creator"));
		for (const command of pluginCommands) {
			//remove commands if the folder is not in the settings
			if (!this.settings.folder.some((folder) => folder.commandName === command.replace("create-note-in-folder:", ""))) {
				//@ts-ignore
				this.app.commands.removeCommand(command);
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
		quickSwitcher = false
	) {
		if (oldFolder !== undefined) {
			//@ts-ignore
			this.app.commands.removeCommand(`create-note-in-folder:${oldFolder}`); //doesn't work in some condition
		}
		if (newFolder !== undefined) {
			if (!newFolder.path.contains("{{current}}")) {
				this.addCommand({
					id: `${newFolder.commandName ?? newFolder.path}`,
					name: `${newFolder.commandName ?? newFolder.path}`,
					callback: async () => {
						createNoteInFolder(newFolder, this);
					}
				});
			} else {
				this.addCommand({
					id: `${newFolder.commandName ?? newFolder.path}`,
					name: `${newFolder.commandName ?? newFolder.path}`,
					checkCallback: (checking: boolean) => {
						//display only {{current}} folder & only if a file exists
						const currentFile = this.app.workspace.getActiveFile() ?? undefined;
						if (currentFile) {
							if (!checking) {
								console.log(newFolder, currentFile);
								createFolderInCurrent(newFolder, currentFile, this);
							}
							return true;
						}
						return false;
					},
				});
			}
		}
		if (quickSwitcher)
			this.quickSwitcherCommand(); //reload the quickswitcher command
	}

	async triggerTemplater(file: TFile, settings: FolderSettings) {
		//@ts-ignore
		if (this.app.plugins.enabledPlugins.has("templater-obsidian")) {
			const templatePath = settings.templater;
			if (!templatePath) {
				return;
			}
			const templateFile = this.app.vault.getAbstractFileByPath(templatePath);
			if (!templateFile) {
				new Notice(i18next.t("error.templateNotFound", { path: templatePath }));
				return;
			} else if (!(templateFile instanceof TFile)) {
				new Notice(i18next.t("error.templateNotFile", { path: templatePath }));
				return;
			}
			const templateContent = await this.app.vault.read(templateFile);
			//add the content to the file
			await this.app.vault.modify(file, templateContent);
			//trigger templater
			try {
				//@ts-ignore
				//note : it will not work if the file is not opened in any leaf
				//maybe we could run templater internally and write the result to the file

				this.app.commands.executeCommandById("templater-obsidian:replace-in-file-templater");
			} catch (e) {
				console.log(e);
				// I think it can work if the file is not opened in main view or something. Prevent error like that.
			}
		}
	}

	quickSwitcherCommand() {
		this.addCommand({
			id: "quickSwitcher-creator",
			name: i18next.t("quickSwitcher.simple"),
			callback: () => {
				try {
					const currentFile = this.app.workspace.getActiveFile() ?? undefined;
					new ChooseFolder(this.app, this, currentFile).open();
				} catch (e) {
					console.log(e);
				}
			},
		});
	}

	quickSwitcherAnyFolder() {
		if (this.settings.enableAllFolder) {
			this.addCommand({
				id: "quickSwitcher-creator-anyFolder",
				name: i18next.t("quickSwitcher.anyFolder"),
				callback: () => {
					try {
						const isCurrentFile = this.app.workspace.getActiveFile() ?? undefined;
						new ChooseInAllFolder(this.app, this, this.settings.filterAnyFolderCommand ?? false, isCurrentFile).open();
					} catch (e) {
						console.log(e);
					}
				},
			});
		} else {
			//@ts-ignore
			this.app.commands.removeCommand("create-note-in-folder:quickSwitcher-creator-anyFolder");
		}
	}

	async onload() {
		console.info(`${this.manifest.name} v${this.manifest.version} loaded`);
		await i18next.init({
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
					type: folder.typeName === "string" ? TemplateType.none : folder.typeName,
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
			folder.commandName = folder.commandName && folder.commandName.length > 0 ? folder.commandName : folder.path;
			await this.saveSettings();
			await this.addNewCommands(undefined, folder);
		}

		this.quickSwitcherCommand();
		this.quickSwitcherAnyFolder();
	}


	onunload() {
		console.info(`${this.manifest.name} v${this.manifest.version} unloaded`);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

