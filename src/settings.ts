import i18next from "i18next";
import {App, PluginSettingTab, Setting} from "obsidian";

import {FolderSuggest} from "./fileSuggest";
import {
	DEFAULT_FOLDER_SETTINGS, FolderSettings
} from "./interface";
import NoteInFolder from "./main";
import {AddFolderModal} from "./modals/add_folder";
import { ManageCustomVariables } from "./modals/manage_custom_variables";

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
			.setName(i18next.t("allFolder.enable"))
			.addToggle(cb => cb
				.setValue(this.plugin.settings.enableAllFolder ?? false)
				.onChange(async (value) => {
					this.plugin.settings.enableAllFolder = value;
					await this.plugin.saveSettings();
					this.plugin.quickSwitcherAnyFolder();
					this.display();
				})
			)
			.addButton(cb => cb
				.setButtonText(i18next.t("allFolder.default.title"))
				.setTooltip(i18next.t("allFolder.default.tooltip"))
				.onClick(() => {
					const defaultTemplate = JSON.parse(JSON.stringify(this.plugin.settings.defaultTemplate ?? DEFAULT_FOLDER_SETTINGS)) as FolderSettings;
					new AddFolderModal(this.app, defaultTemplate, true, (result) => {
						this.plugin.settings.defaultTemplate = result;
						this.plugin.saveSettings();
					}).open();
				})
			);
		if (this.plugin.settings.enableAllFolder) {
			new Setting(containerEl)
				.setName(i18next.t("allFolder.listAllModals"))
				.addToggle(cb => cb
					.setValue(this.plugin.settings.listAllFolderInModals ?? false)
					.onChange(async (value) => {
						this.plugin.settings.listAllFolderInModals = value;
						await this.plugin.saveSettings();
					})
				);
			new Setting(containerEl)
				.setName(i18next.t("allFolder.filterAnyFolderCommand.title"))
				.setDesc(i18next.t("allFolder.filterAnyFolderCommand.desc"))
				.addToggle(cb => cb
					.setValue(this.plugin.settings.filterAnyFolderCommand ?? false)
					.onChange(async (value) => {
						this.plugin.settings.filterAnyFolderCommand = value;
						await this.plugin.saveSettings();
					})
				);
		}

		new Setting(containerEl)
			.setClass("no-display")
			.addButton(cb => cb
				.setButtonText(i18next.t("variable.title"))
				.onClick(() => {
					const customVariable = JSON.parse(JSON.stringify(this.plugin.settings.customVariables ?? []));
					new ManageCustomVariables(this.app, customVariable , async (result)  => {
						this.plugin.settings.customVariables = result;
						await this.plugin.saveSettings();
					}).open();
				})
			);

		containerEl.createEl("h3", {text: i18next.t("title")} as const);

		for (let folder of this.plugin.settings.folder) {
			const sett = new Setting(containerEl)
				.setClass("no-display")
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
							const folderSettings = JSON.parse(JSON.stringify(folder)) as FolderSettings;
							const index = this.plugin.settings.folder.indexOf(folder);
							new AddFolderModal(this.app, folderSettings, false, async (result)  => {
								folder = result;
								this.plugin.settings.folder[index] = result;
								await this.plugin.addNewCommands(this.plugin.settings.folder[index].commandName, this.plugin.settings.folder[index], true);
								await this.plugin.removeCommands();
								if (!result.fileMenu) {
									this.plugin.removeDisabledMenu(result);
								}
								await this.plugin.saveSettings();
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
				});

			/**
			 * if folder is not the first one in the setting
			 * add a "up-arrow" button */
			const disableUpArrow = this.plugin.settings.folder.indexOf(folder) === 0;

			sett.addExtraButton(cb => {
				if (!disableUpArrow)
					cb.setTooltip(i18next.t("up"));
				cb
					.setDisabled(disableUpArrow)
					.setIcon("arrow-up")
					.setTooltip(i18next.t("up"))
					.onClick(async () => {
						const index = this.plugin.settings.folder.indexOf(folder);
						this.plugin.settings.folder.splice(index, 1);
						this.plugin.settings.folder.splice(index - 1, 0, folder);
						await this.plugin.saveSettings();
						this.display();
					});
			});
			/**
			 * if folder is not the last one in the setting
			 * add a "down-arrow" button */
			const disableDownArrow = this.plugin.settings.folder.indexOf(folder) === this.plugin.settings.folder.length - 1;
			sett.addExtraButton(cb => {
				if (!disableDownArrow)
					cb.setTooltip(i18next.t("down"));
				cb
					.setDisabled(disableDownArrow)
					.setIcon("arrow-down")
					.onClick(async () => {
						const index = this.plugin.settings.folder.indexOf(folder);
						this.plugin.settings.folder.splice(index, 1);
						this.plugin.settings.folder.splice(index + 1, 0, folder);
						await this.plugin.saveSettings();
						this.display();
					});
			});


			sett.addButton(cb =>
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
					const defaultSettings = JSON.parse(JSON.stringify(this.plugin.settings.defaultTemplate ?? DEFAULT_FOLDER_SETTINGS));
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
