import i18next from "i18next";
import { moment, Notice, Plugin, TFile, WorkspaceLeaf } from "obsidian";

import { ressources, translationLanguage } from "./i18n/i18next";
import {
	CustomVariables,
	DEFAULT_FOLDER_SETTINGS,
	DEFAULT_SETTINGS,
	DefaultOpening,
	FolderSettings,
	NoteInFolderSettings,
	Position,
	TemplateType
} from "./interface";
import { NoteInFolderSettingsTab } from "./settings";

export default class NoteInFolder extends Plugin {
	settings: NoteInFolderSettings;

	/**
	 * A function to generate the filename using the template settings & filename settings
	 * @param folder {FolderSettings} The folder settings
	 * @returns {string} The generated filename
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
			generatedName = folder.path.split("/").pop();
		}
		if (template.position === Position.prepend && generatedName) {
			defaultName = generatedName + template.separator + defaultName;
		} else if (template.position === Position.append && generatedName) {
			defaultName = defaultName + template.separator + generatedName;
		}
		const folderPath = folder.path !== "/" ? `${folder.path}/` : "";
		while (this.app.vault.getAbstractFileByPath(`${folderPath}${defaultName}.md`) && template.increment) {
			const increment = defaultName.match(/ \d+$/);
			const newIncrement = increment ? parseInt(increment[0]) + 1 : 1;
			defaultName = `${defaultName.replace(/ \d+$/, "")} ${newIncrement}`;
		}
		return `${defaultName}.md`;
	}

	replaceVariables(filePath: string, customVariables: CustomVariables[]) {
		const hasBeenReplaced: boolean[] = [];
		for (const variable of customVariables) {
			if (filePath.match(`{{${variable.name}}}`)) {
				if (variable.type === "string") {
					filePath = filePath.replace(`{{${variable.name}}}`, variable.value);
				} else {
					filePath = filePath.replace(`{{${variable.name}}}`, moment().format(variable.value));
				}
				hasBeenReplaced.push(true);
			} else if (variable.name.match(/^\/.+\/[gimy]*$/)) {
				const regex = new RegExp(variable.name.replace(/^\/(.+)\/[gimy]*$/, "{{$1}}"), variable.name.replace(/^\/.+\/([gimy]*)$/, "$1"));
				if (filePath.match(regex)) {
					filePath = filePath.replace(regex, variable.value);
					hasBeenReplaced.push(true);
				}
			}
		}
		return { path: filePath, hasBeenReplaced: hasBeenReplaced.length > 0 };
	}



	/**
	 * For an unknown reason, the remove commands for a specific folder-path is not working
	 * This function check all the commands of the plugin and remove the ones that are not in the settings
	 * @returns {Promise<void>}
	 */
	async removeCommands(): Promise<void> {
		//@ts-ignore
		const pluginCommands = Object.keys(this.app.commands.commands).filter((command) => command.startsWith("create-note-in-folder"));
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
	) {
		if (oldFolder !== undefined) {
			//@ts-ignore
			this.app.commands.removeCommand(`create-note-in-folder:${oldFolder}`); //doesn't work in some condition
		}
		if (newFolder !== undefined) {
			if (!newFolder.path.contains("{{current}}")) {
			// eslint-disable-next-line prefer-const
				let { path, hasBeenReplaced } = this.replaceVariables(newFolder.path, this.settings.customVariables);
				this.addCommand({
					id: `${newFolder.commandName ?? newFolder.path}`,
					name: `${newFolder.commandName ?? newFolder.path}`,
					callback: async () => {
						newFolder.path = path.endsWith("/") && path !== "/" ? path : `${path}/`;
						const defaultName = this.generateFileName(newFolder);
						if (!this.app.vault.getAbstractFileByPath(path)) {
							if (hasBeenReplaced) {
								//create folder if it doesn't exist
								await this.app.vault.createFolder(path);
							} else {
								if (newFolder.path.contains("{{current}}")) {
									new Notice(i18next.t("error.currentWithoutfile", { path: newFolder.path }));
									return;
								}
								new Notice(i18next.t("error.pathNoFound", { path: newFolder.path }));
								//remove from settings
								this.settings.folder.splice(this.settings.folder.indexOf(newFolder), 1);
								await this.saveSettings();
								await this.addNewCommands(newFolder.commandName, undefined);
								return;
							}
						}
						console.log(i18next.t("log", { path: path, name: defaultName }));
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
						const file = this.app.vault.getAbstractFileByPath(`${newFolder.path}${defaultName}`);
						if (file instanceof TFile) {
							await leaf.openFile(file, { active: newFolder.focused });
						}
						if (!file) {
							const newFile = await this.app.vault.create(`${newFolder.path}${defaultName}`, "");
							await leaf.openFile(newFile, { active: newFolder.focused });
							await this.triggerTemplater(newFile, newFolder);
						}
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
								const { path, hasBeenReplaced } = this.replaceVariables(newFolder.path, this.settings.customVariables);
								const parent = currentFile.parent ? currentFile.parent.path : "/";
								const currentFolder = JSON.parse(JSON.stringify(newFolder)) as FolderSettings;
								currentFolder.path = path.replace("{{current}}", `${parent}/`);
								currentFolder.path = currentFolder.path === "//" ? "/" : currentFolder.path;
								const folderPath = currentFolder.path !== "/" ? currentFolder.path.replace(/\/$/, "") : "/";
								const defaultName = this.generateFileName(currentFolder);
								if (!this.app.vault.getAbstractFileByPath(folderPath)) {
									if (hasBeenReplaced) {
										//create folder if it doesn't exist
										this.app.vault.createFolder(currentFolder.path);
									} else {
										new Notice(i18next.t("error.pathNoFound", { path: currentFolder.path }));
										return;
									}
								}
								console.log(i18next.t("log", { path: currentFolder.path, name: defaultName }));
								let leaf: WorkspaceLeaf;
								switch (currentFolder.opening) {
								case DefaultOpening.split:
									leaf = this.app.workspace.getLeaf("split", currentFolder.splitDefault);
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
								const file = this.app.vault.getAbstractFileByPath(`${currentFolder.path}${defaultName}`);
								if (file instanceof TFile) {
									leaf.openFile(file, { active: currentFolder.focused });
								}
								if (!file) {
									this.app.vault.create(`${currentFolder.path}${defaultName}`, "").then((file) => {
										leaf.openFile(file, { active: currentFolder.focused });
										this.triggerTemplater(file, currentFolder);
									});
								}
							}
							return true;
						}
						return false;
					},
				});
			}
		}
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
				this.app.commands.executeCommandById("templater-obsidian:replace-in-file-templater");
			} catch (e) {
				console.log(e);
				// I think it can work if the file is not opened in main view or something. Prevent error like that.
			}
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

