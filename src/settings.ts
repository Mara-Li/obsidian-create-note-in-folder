import i18next from "i18next";
import {App, PluginSettingTab, Setting} from "obsidian";

import {FolderSuggest} from "./fileSuggest";
import {
	DEFAULT_FOLDER_SETTINGS, FolderSettings
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
		containerEl.addClasses(["create-note-in-folder", "settingsTab"]);
		containerEl.createEl("h1", {text: this.plugin.manifest.name});
		containerEl.createEl("p", {text: i18next.t("variable.current.desc")});
		containerEl.createEl("p", {text: i18next.t("variable.current.warning"), cls: "is-warning"});
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
				.addButton(cb =>
					cb
						.setIcon("copy")
						.setTooltip(i18next.t("duplicate"))
						.onClick(async () => {
							let defaultSettings = JSON.parse(JSON.stringify(folder));
							defaultSettings = this.duplicateFolder(defaultSettings);
							this.plugin.settings.folder.push(defaultSettings);
							await this.plugin.saveSettings();
							this.display();
						})
				)
				.addButton(cb =>
					cb
						.setIcon("pencil")
						.setTooltip(i18next.t("editFolder.title"))
						.onClick(async () => {
							new AddFolderModal(this.app, folder, (result)  => {
								this.plugin.settings.folder[this.plugin.settings.folder.indexOf(folder)] = result;
								this.plugin.saveSettings();
							}).open();
						}))
				.addText(cb => {
					cb

						.setPlaceholder(i18next.t("commandName"))
						.setValue(folder.commandName ?? folder.path)
						.onChange(async (value) => {
							const oldCommandName = folder.commandName;
							folder.commandName = value;
							await this.plugin.addNewCommands(oldCommandName, folder, true);
							await this.plugin.removeCommands();
							await this.plugin.saveSettings();
						});
					/**
					 * When the user focus the cb input, a tooltip must be displayed to say "command name"
					 */
					this.addTooltip(i18next.t("commandName"), cb.inputEl);
				})
				.addSearch((cb) => {
					new FolderSuggest(cb.inputEl);
					cb.setPlaceholder(i18next.t("example"));
					cb.setValue(folder.path);
					cb.onChange(async (value) => {
						const oldCommandName = folder.commandName && folder.commandName.length > 0 ? folder.commandName : value;
						folder.path = value;
						folder.commandName = oldCommandName;
						await this.plugin.addNewCommands(oldCommandName, folder, true);
						await this.plugin.removeCommands();
						await this.plugin.saveSettings();
					});
					this.addTooltip(i18next.t("path"), cb.inputEl);
				})
				.addButton(cb =>
					cb
						.setIcon("cross")
						.setTooltip(i18next.t("remove"))
						.onClick(async () => {
							this.plugin.settings.folder.splice(this.plugin.settings.folder.indexOf(folder), 1);
							await this.plugin.saveSettings();
							await this.plugin.addNewCommands(folder.commandName, undefined, true);
							this.display();
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

	duplicateFolder(folder: FolderSettings) {
		const defaultSettings = JSON.parse(JSON.stringify(folder));
		const duplicatedFolders = this.plugin.settings.folder.filter((f) => f.commandName.replace(/ \(\d+\)+/, "") === folder.commandName.replace(/ \(\d+\)+/, ""));
		if (duplicatedFolders.length > 0) {
			defaultSettings.commandName = `${folder.commandName.replace(/ \(\d+\)+/, "")} (${duplicatedFolders.length})`;
		}
		return defaultSettings;
	}

	addTooltip(text: string, cb: HTMLElement) {
		cb.onfocus = () => {
			const tooltip = cb.parentElement?.createEl("div", {text: text, cls: "tooltip"});
			if (tooltip) {
				const rec = cb.getBoundingClientRect();
				tooltip.style.top = `${rec.top + rec.height + 5}px`;
				tooltip.style.left = `${rec.left + rec.width / 2}px`;
			}
		};
		cb.onblur = () => {
			cb.parentElement?.querySelector(".tooltip")?.remove();
		};
	}
}
