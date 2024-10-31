import i18next from "i18next";
import { normalizePath, Notice, Plugin, TFile, TFolder } from "obsidian";
import { merge } from "ts-deepmerge";
import { klona } from "klona";
import { ressources, translationLanguage } from "./i18n/i18next";
import {
	DEFAULT_FOLDER_SETTINGS,
	DEFAULT_SETTINGS,
	type FolderSettings,
	type NoteInFolderSettings,
	Position,
	TemplateType,
} from "./interface";
import { ChooseFolder, ChooseInAllFolder } from "./modals/choose_in_folder";
import { NoteInFolderSettingsTab } from "./settings";
import {createFolderInCurrent, createNoteInFolder, templaterParseTemplate} from "./utils/create_note";
import { generateFileNameWithCurrent } from "./utils/utils";

export default class NoteInFolder extends Plugin {
	settings: NoteInFolderSettings;

	/**
	 * For an unknown reason, the remove commands for a specific folder-path is not working
	 * This function check all the commands of the plugin and remove the ones that are not in the settings
	 * @returns {Promise<void>}
	 */
	async removeCommands(): Promise<void> {
		let pluginCommands = Object.keys(this.app.commands.commands).filter((command) =>
			command.startsWith("create-note-in-folder")
		);
		//remove quickswitcher command
		pluginCommands = pluginCommands.filter(
			(command) =>
				!command.replace("create-note-in-folder:", "").contains("quickSwitcher-creator")
		);
		for (const command of pluginCommands) {
			//remove commands if the folder is not in the settings
			if (
				!this.settings.folder.some(
					(folder) => folder.commandName === command.replace("create-note-in-folder:", "")
				)
			)
				this.app.commands.removeCommand(command);
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
			this.app.commands.removeCommand(`create-note-in-folder:${oldFolder}`); //doesn't work in some condition
		}
		if (newFolder !== undefined) {
			if (newFolder.path.contains("{{current}}")) {
				this.addCommand({
					id: `${newFolder.commandName ?? newFolder.path}`,
					name: `${newFolder.commandName ?? newFolder.path}`,
					checkCallback: (checking: boolean) => {
						//display only {{current}} folder & only if a file exists
						const currentFile = this.app.workspace.getActiveFile() ?? undefined;
						if (currentFile) {
							if (!checking) {
								createFolderInCurrent(newFolder, currentFile, this);
							}
							return true;
						}
						return false;
					},
				});
			} else {
				this.addCommand({
					id: `${newFolder.commandName ?? newFolder.path}`,
					name: `${newFolder.commandName ?? newFolder.path}`,
					callback: async () => {
						await createNoteInFolder(newFolder, this);
					},
				});
			}
		}
		if (quickSwitcher) this.quickSwitcherCommand(); //reload the quickswitcher command
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				const folder = file instanceof TFolder ? file : file.parent;
				if (
					!(
						(newFolder?.fileMenu && newFolder?.path.contains("{{current}}")) ||
						(folder && newFolder?.path === folder.path)
					)
				) {
					return;
				}
				let commandName =
					newFolder.commandName ?? `${i18next.t("create")} ${newFolder.path}`;
				const { folderPath, defaultName } = generateFileNameWithCurrent(
					newFolder,
					file,
					this
				);
				const path = normalizePath(`${folderPath}/${defaultName}`);
				const fileAlreadyExists = this.app.vault.getAbstractFileByPath(
					newFolder.path.replace("{{current}}", path)
				);
				if (fileAlreadyExists && !newFolder.template.increment)
					commandName = `Open note : ${newFolder.commandName ?? newFolder.path}`;
				//prevent duplicate command
				if (
					menu.items.some((item) => {
						//@ts-ignore
						return item.titleEl?.getText() === commandName;
					})
				)
					return;
				menu.addSections(["create-note-in-folder"]);
				menu.addItem((item) => {
					item
						.setTitle(commandName)
						.setIcon("file-plus")
						.setSection("create-note-in-folder")
						.onClick(() => {
							createFolderInCurrent(newFolder, file, this);
						});
				});
			})
		);
	}
	/**
	 *
	 * @param disabled
	 * @param increment Only remove the "open note" command if the increment is true; otherwise, remove all the commands
	 */
	removeDisabledMenu(
		disabled: FolderSettings,
		toRemove: "all" | "increment" | "create" = "all"
	) {
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu) => {
				let commandName = `Create note : ${disabled.commandName ?? disabled.path}`;
				if (toRemove === "increment")
					commandName = `Open note : ${disabled.commandName ?? disabled.path}`;
				else if (toRemove === "create")
					commandName = `Create note : ${disabled.commandName ?? disabled.path}`;
				for (const item of menu.items) {
					//@ts-ignore
					const itemName: string | undefined = item.titleEl?.getText() ?? item.titleEl;
					if (itemName === commandName)
						item.dom.addClasses(["create-note-in-folder", "disabled"]);
					else if (
						toRemove === "all" &&
						(itemName === commandName ||
							itemName === `Open note : ${disabled.commandName ?? disabled.path}`)
					) {
						item.dom.addClasses(["create-note-in-folder", "disabled"]);
					}
				}
			})
		);
	}

	async triggerTemplater(file: TFile, settings: FolderSettings) {
		if (!this.app.plugins.enabledPlugins.has("templater-obsidian")) return;

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
		const templated = await templaterParseTemplate(this.app, templateContent, file)
		await this.app.vault.modify(file, templated);
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
						new ChooseInAllFolder(
							this.app,
							this,
							this.settings.filterAnyFolderCommand ?? false,
							isCurrentFile
						).open();
					} catch (e) {
						console.log(e);
					}
				},
			});
		} else {
			this.app.commands.removeCommand(
				"create-note-in-folder:quickSwitcher-creator-anyFolder"
			);
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
				const defaultSettings = klona(DEFAULT_FOLDER_SETTINGS); //for some reason, i need to make a deep copy of the default settings
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
					type: folder.typeName === "string" ? TemplateType.None : folder.typeName,
					//@ts-ignore
					format: folder.formatName,
					position: Position.Append,
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
			folder.commandName =
				folder.commandName && folder.commandName.length > 0
					? folder.commandName
					: folder.path;
			await this.saveSettings();
			await this.addNewCommands(undefined, folder);
		}

		this.quickSwitcherCommand();
		this.quickSwitcherAnyFolder();
	}

	onunload() {
		console.info(`${this.manifest.name} v${this.manifest.version} unloaded`);
	}

	mergeFolderSettings() {
		//add new value in the settings for each folder
		for (const i in this.settings.folder) {
			this.settings.folder[i] = merge(
				DEFAULT_FOLDER_SETTINGS,
				this.settings.folder[i]
			) as unknown as FolderSettings;
		}
		return this.settings;
	}

	async loadSettings() {
		const loadData = await this.loadData();
		try {
			this.settings = merge(
				DEFAULT_SETTINGS,
				loadData
			) as unknown as NoteInFolderSettings;
			this.settings = this.mergeFolderSettings();
		} catch (_e) {
			console.warn("Error while merging folder settings ; use default merge");
			this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
