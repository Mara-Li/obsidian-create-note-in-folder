import i18next from "i18next";
import {App, PluginSettingTab, Setting} from "obsidian";

import {FolderSuggest} from "./fileSuggest";
import {
	DEFAULT_FOLDER_SETTINGS
} from "./interface";
import NoteInFolder from "./main";
import {AddFolderModal, ManageCustomVariables} from "./modal";

export class NoteInFolderSettingsTab extends PluginSettingTab {
	plugin: NoteInFolder;
	
	constructor(app: App, plugin: NoteInFolder) {
		super(app, plugin);
		this.plugin = plugin;
	}
	
	display(): void {
		const {containerEl} = this;
		containerEl.empty();
		containerEl.createEl("h1", {text: this.plugin.manifest.name});
		
		new Setting(containerEl)
			.addButton(cb => cb
				.setButtonText(i18next.t("variable.title"))
				.onClick(() => {
					new ManageCustomVariables(this.app, this.plugin.settings.customVariables ?? [], async (result)  => {
						this.plugin.settings.customVariables = result;
						await this.plugin.saveSettings();
					}).open();
				})
			);
		
		containerEl.createEl("h3", {text: i18next.t("title")} as const);
		
		for (const folder of this.plugin.settings.folder) {
			new Setting(containerEl)
				.setClass("create-note-in-folder")
				.setClass("settingsTab")
				.addText(cb => {
					cb
						.setPlaceholder(i18next.t("commandName"))
						.setValue(folder.commandName ?? folder.path)
						.onChange(async (value) => {
							const oldCommandName = folder.commandName;
							folder.commandName = value;
							await this.plugin.addNewCommands(oldCommandName, folder);
							await this.plugin.removeCommands();
							await this.plugin.saveSettings();
						});
				})
				.addSearch((cb) => {
					new FolderSuggest(cb.inputEl);
					cb.setPlaceholder(i18next.t("example"));
					cb.setValue(folder.path);
					cb.onChange(async (value) => {
						const oldCommandName = folder.commandName && folder.commandName.length > 0 ? folder.commandName : value;
						folder.path = value;
						folder.commandName = oldCommandName;
						await this.plugin.addNewCommands(oldCommandName, folder);
						await this.plugin.removeCommands();
						await this.plugin.saveSettings();
					});
				})
				.addButton(cb =>
					cb
						.setIcon("cross")
						.setTooltip(i18next.t("remove"))
						.onClick(async () => {
							this.plugin.settings.folder.splice(this.plugin.settings.folder.indexOf(folder), 1);
							await this.plugin.saveSettings();
							await this.plugin.addNewCommands(folder.commandName, undefined);
							this.display();
						}))
				.addButton(cb =>
					cb
						.setIcon("pencil")
						.setTooltip(i18next.t("editFolder.title"))
						.onClick(async () => {
							new AddFolderModal(this.app, folder, (result)  => {
								this.plugin.settings.folder[this.plugin.settings.folder.indexOf(folder)] = result;
								this.plugin.saveSettings();
							}).open();
						}));
		}
		new Setting(containerEl)
			.addButton(cb => cb
				.setButtonText(i18next.t("editFolder.add"))
				.onClick(async () => {
					//create a copy of the default settings
					const defaultSettings = JSON.parse(JSON.stringify(DEFAULT_FOLDER_SETTINGS));
					this.plugin.settings.folder.push(defaultSettings);
					await this.plugin.saveSettings();
					this.display();
				}));
		
	}
}
