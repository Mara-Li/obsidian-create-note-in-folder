import i18next from "i18next";
import { type App, PluginSettingTab, Setting } from "obsidian";

import { DEFAULT_FOLDER_SETTINGS, type FolderSettings } from "./interface";
import type NoteInFolder from "./main";
import { AddFolderModal } from "./modals/add_folder";
import { ManageCustomVariables } from "./modals/manage_custom_variables";
import { FolderSuggester } from "./fileSuggest";
import { klona } from "klona";

export class NoteInFolderSettingsTab extends PluginSettingTab {
	plugin: NoteInFolder;

	constructor(app: App, plugin: NoteInFolder) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.addClasses(["create-note-in-folder", "settingsTab"]);

		containerEl.createEl("p", { text: i18next.t("variable.current.desc") });
		containerEl.createEl("p", {
			text: i18next.t("variable.current.warning"),
			cls: "is-warning",
		});

		new Setting(containerEl)
			.setName(i18next.t("allFolder.enable"))
			.addToggle((cb) =>
				cb
					.setValue(this.plugin.settings.enableAllFolder ?? false)
					.onChange(async (value) => {
						this.plugin.settings.enableAllFolder = value;
						await this.plugin.saveSettings();
						this.plugin.quickSwitcherAnyFolder();
						this.display();
					})
			)
			.addButton((cb) =>
				cb
					.setButtonText(i18next.t("allFolder.default.title"))
					.setTooltip(i18next.t("allFolder.default.tooltip"))
					.onClick(() => {
						const defaultTemplate = klona(
							this.plugin.settings.defaultTemplate ?? DEFAULT_FOLDER_SETTINGS
						);
						new AddFolderModal(this.app, defaultTemplate, true, (result) => {
							this.plugin.settings.defaultTemplate = result;
							this.plugin.saveSettings();
						}).open();
					})
			);
		if (this.plugin.settings.enableAllFolder) {
			new Setting(containerEl)
				.setName(i18next.t("allFolder.listAllModals"))
				.addToggle((cb) =>
					cb
						.setValue(this.plugin.settings.listAllFolderInModals ?? false)
						.onChange(async (value) => {
							this.plugin.settings.listAllFolderInModals = value;
							await this.plugin.saveSettings();
						})
				);
			new Setting(containerEl)
				.setName(i18next.t("allFolder.filterAnyFolderCommand.title"))
				.setDesc(i18next.t("allFolder.filterAnyFolderCommand.desc"))
				.addToggle((cb) =>
					cb
						.setValue(this.plugin.settings.filterAnyFolderCommand ?? false)
						.onChange(async (value) => {
							this.plugin.settings.filterAnyFolderCommand = value;
							await this.plugin.saveSettings();
						})
				);
		}

		new Setting(containerEl).setClass("no-display").addButton((cb) =>
			cb.setButtonText(i18next.t("variable.title")).onClick(() => {
				const customVariable = klona(this.plugin.settings.customVariables ?? []);

				new ManageCustomVariables(this.app, customVariable, async (result) => {
					this.plugin.settings.customVariables = result;
					await this.plugin.saveSettings();
				}).open();
			})
		);

		new Setting(containerEl).setHeading().setName(i18next.t("title"));

		for (let folder of this.plugin.settings.folder) {
			const sett = new Setting(containerEl)
				.setClass("no-display")
				.addButton((cb) =>
					cb
						.setIcon("copy")
						.setTooltip(i18next.t("duplicate"))
						.onClick(async () => {
							let defaultSettings = klona(folder);
							defaultSettings = this.duplicateFolder(defaultSettings);
							this.plugin.settings.folder.push(defaultSettings);
							await this.plugin.saveSettings();
							this.display();
						})
				)
				.addButton((cb) =>
					cb
						.setIcon("pencil")
						.setTooltip(i18next.t("editFolder.title"))
						.onClick(async () => {
							const folderSettings = klona(folder);
							const index = this.plugin.settings.folder.indexOf(folder);
							new AddFolderModal(this.app, folderSettings, false, async (result) => {
								folder = result;
								this.plugin.settings.folder[index] = result;
								await this.plugin.addNewCommands(
									this.plugin.settings.folder[index].commandName,
									this.plugin.settings.folder[index],
									true
								);
								await this.plugin.removeCommands();
								if (!result.fileMenu) {
									this.plugin.removeDisabledMenu(result, "all");
								} else if (!result.template.increment) {
									this.plugin.removeDisabledMenu(result, "create");
								} else if (result.template.increment) {
									this.plugin.removeDisabledMenu(result, "increment");
								}
								await this.plugin.saveSettings();
							}).open();
						})
				)
				.addText((cb) => {
					cb.setPlaceholder(i18next.t("commandName"))
						.setValue(folder.commandName ?? folder.path)
						.onChange(async (value) => {
							const oldCommandName = folder.commandName;
							const oldCommand = klona(folder);
							folder.commandName = value;
							await this.plugin.addNewCommands(oldCommandName, folder, true);
							await this.plugin.removeCommands();
							this.plugin.removeDisabledMenu(oldCommand, "all");
							await this.plugin.saveSettings();
						});
					/**
					 * When the user focus the cb input, a tooltip must be displayed to say "command name"
					 */
					this.addTooltip(i18next.t("commandName"), cb.inputEl);
				})
				.addSearch(async (cb) => {
					cb.setPlaceholder(i18next.t("example"));
					cb.setValue(folder.path);
					new FolderSuggester(cb.inputEl, this.app, async (result) => {
						folder.path = result;
						const oldCommandName =
							folder.commandName && folder.commandName.length > 0
								? folder.commandName
								: result;
						folder.commandName = oldCommandName;
						await this.plugin.removeCommands();
						await this.plugin.addNewCommands(oldCommandName, folder, true);
					});
					await this.plugin.saveSettings();
					this.addTooltip(i18next.t("path"), cb.inputEl);
				});

			/**
			 * if folder is not the first one in the setting
			 * add a "up-arrow" button */
			const disableUpArrow = this.plugin.settings.folder.indexOf(folder) === 0;

			sett.addExtraButton((cb) => {
				if (!disableUpArrow) cb.setTooltip(i18next.t("up"));
				cb.setDisabled(disableUpArrow)
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
			const disableDownArrow =
				this.plugin.settings.folder.indexOf(folder) ===
				this.plugin.settings.folder.length - 1;
			sett.addExtraButton((cb) => {
				if (!disableDownArrow) cb.setTooltip(i18next.t("down"));
				cb.setDisabled(disableDownArrow)
					.setIcon("arrow-down")
					.onClick(async () => {
						const index = this.plugin.settings.folder.indexOf(folder);
						this.plugin.settings.folder.splice(index, 1);
						this.plugin.settings.folder.splice(index + 1, 0, folder);
						await this.plugin.saveSettings();
						this.display();
					});
			});

			sett.addButton((cb) =>
				cb
					.setIcon("cross")
					.setTooltip(i18next.t("remove"))
					.onClick(async () => {
						this.plugin.settings.folder.splice(
							this.plugin.settings.folder.indexOf(folder),
							1
						);
						await this.plugin.saveSettings();
						await this.plugin.addNewCommands(folder.commandName, undefined, true);
						this.display();
					})
			);
		}
		new Setting(containerEl).addButton((cb) =>
			cb.setButtonText(i18next.t("editFolder.add")).onClick(async () => {
				//create a copy of the default settings
				const defaultSettings = klona(
					this.plugin.settings.defaultTemplate ?? DEFAULT_FOLDER_SETTINGS
				);
				this.plugin.settings.folder.push(defaultSettings);
				await this.plugin.saveSettings();
				this.display();
			})
		);
	}

	duplicateFolder(folder: FolderSettings) {
		const defaultSettings = klona(folder);
		const duplicatedFolders = this.plugin.settings.folder.filter(
			(f) =>
				f.commandName.replace(/ \(\d+\)+/, "") ===
				folder.commandName.replace(/ \(\d+\)+/, "")
		);
		if (duplicatedFolders.length > 0) {
			defaultSettings.commandName = `${folder.commandName.replace(/ \(\d+\)+/, "")} (${
				duplicatedFolders.length
			})`;
		}
		return defaultSettings;
	}

	addTooltip(text: string, cb: HTMLElement) {
		cb.onfocus = () => {
			const tooltip = document.body.createEl("div", { text, cls: "tooltip" });
			if (!tooltip) return;
			tooltip.createEl("div", { cls: "tooltip-arrow" });
			const rec = cb.getBoundingClientRect();
			tooltip.style.top = `${rec.top + rec.height + 5}px`;
			tooltip.style.left = `${rec.left + rec.width / 2}px`;
			tooltip.style.right = `${rec.right}px`;
			tooltip.style.width = `max-content`;
			tooltip.style.height = `max-content`;
		};
		cb.onblur = () => {
			// biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
			activeDocument.querySelector(".tooltip")?.remove();
		};
	}
}
