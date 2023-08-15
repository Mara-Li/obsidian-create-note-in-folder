import i18next from "i18next";
import {App, Notice, PluginSettingTab, Setting} from "obsidian";

import {FolderSuggest} from "./fileSuggest";
import {
	DEFAULT_FOLDER_SETTINGS
} from "./interface";
import NoteInFolder from "./main";
import {AddFolderModal} from "./modal";

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
		containerEl.createEl("h3", {text: i18next.t("title")} as const);
		this.plugin.settings.folder.forEach((folder, index) => {
			new Setting(containerEl)
				.setClass("create-note-in-folder")
				.setClass("settingsTab")
				.addSearch((cb) => {
					new FolderSuggest(cb.inputEl);
					cb.setPlaceholder(i18next.t("example"));
					cb.setValue(this.plugin.settings.folder[index].path);
					cb.onChange(async (value) => {
						if (this.plugin.settings.folder.some((folder) => folder.path === value) && value !== this.plugin.settings.folder[index].path) {
							new Notice(i18next.t("error"));
							value = "";
							cb.setValue("");
						}
						const newFolder = this.plugin.settings.folder[index];
						newFolder.path = value;
						const oldFolder = this.plugin.settings.folder[index].path;
						await this.plugin.addNewCommands(oldFolder, newFolder);
						await this.plugin.removeCommands();
						this.plugin.settings.folder[index].path = value;
						await this.plugin.saveSettings();
					});
				})
				.addButton(cb =>
					cb
						.setIcon("cross")
						.setTooltip(i18next.t("remove"))
						.onClick(async () => {
							const folderDeleted = this.plugin.settings.folder[index];
							this.plugin.settings.folder.splice(index, 1);
							await this.plugin.saveSettings();
							await this.plugin.addNewCommands(folderDeleted.path, undefined);
							this.display();
						}))
				.addButton(cb =>
					cb
						.setIcon("pencil")
						.setTooltip(i18next.t("modal"))
						.onClick(async () => {
							new AddFolderModal(this.app, this.plugin.settings.folder[index], (result)  => {
								this.plugin.settings.folder[index] = result;
								this.plugin.saveSettings();
							}).open();
						}));
			
		});
		new Setting(containerEl)
			.addButton(cb => cb
				.setButtonText(i18next.t("add"))
				.onClick(async () => {
					//create a copy of the default settings
					const defaultSettings = JSON.parse(JSON.stringify(DEFAULT_FOLDER_SETTINGS));
					this.plugin.settings.folder.push(defaultSettings);
					await this.plugin.saveSettings();
					this.display();
				}));
		
	}
}
