import {App, Notice, PluginSettingTab, Setting} from "obsidian";
import NoteInFolder from "./main";
import {FolderSuggest} from "./fileSuggest";
import {
	DEFAULT_FOLDER_SETTINGS
} from "./interface";
import {t} from "./i18n";
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
		containerEl.createEl("h3", {text: t("title") as string});
		this.plugin.settings.folder.forEach((folder, index) => {
			new Setting(containerEl)
				.setClass("note-in-folder-setting")
				.addSearch((cb) => {
					new FolderSuggest(cb.inputEl);
					cb.setPlaceholder(t("example") as string);
					cb.setValue(this.plugin.settings.folder[index].path);
					cb.onChange(async (value) => {
						if (this.plugin.settings.folder.some((folder) => folder.path === value) && value !== this.plugin.settings.folder[index].path) {
							new Notice(t("error") as string);
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
						.setTooltip(t("remove") as string)
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
						.setTooltip(t("modal") as string)
						.onClick(async () => {
							new AddFolderModal(this.app, this.plugin.settings.folder[index], (result)  => {
								this.plugin.settings.folder[index] = result;
								this.plugin.saveSettings();
							}).open();
						}));
			
		});
		new Setting(containerEl)
			.addButton(cb => cb
				.setButtonText(t("add") as string)
				.onClick(async () => {
					//create a copy of the default settings
					const defaultSettings = JSON.parse(JSON.stringify(DEFAULT_FOLDER_SETTINGS));
					this.plugin.settings.folder.push(defaultSettings);
					await this.plugin.saveSettings();
					this.display();
					
				}));
		
	}
}
