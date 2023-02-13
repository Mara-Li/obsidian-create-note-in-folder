import {App, Notice, PluginSettingTab, Setting} from "obsidian";
import NoteInFolder from "./main";
import {FolderSuggest} from "./fileSuggest";
import {DefaultOpening, SplitDirection} from "./interface";
import {t} from "./i18n";
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
			.setName(t("name.title") as string)
			.setDesc(t("name.desc") as string)
			.addText(cb => cb
				.setValue(this.plugin.settings.defaultName)
				.onChange(async (value) => {
					this.plugin.settings.defaultName = value;
					await this.plugin.saveSettings();
				}));
		
		const opening = new Setting(containerEl)
			.setName(t("opening.title") as string)
			.setDesc(t("opening.desc") as string)
			.addDropdown(cb => cb
				.addOption(DefaultOpening.newTab, t("opening.dropDown.newTab") as string)
				.addOption(DefaultOpening.current, t("opening.dropDown.current") as string)
				.addOption(DefaultOpening.newWindow, t("opening.dropDown.newWindow") as string)
				.addOption(DefaultOpening.split, t("opening.dropDown.split.title") as string)
				.setValue(this.plugin.settings.opening)
				.onChange(async (value) => {
					this.plugin.settings.opening = value as DefaultOpening;
					await this.plugin.saveSettings();
					this.display();
				}));
		
		if (this.plugin.settings.opening === DefaultOpening.split) {
			opening
				.addDropdown(cb => cb
					.addOption(SplitDirection.horizontal, t("opening.dropDown.split.dropDown.horizontal") as string)
					.addOption(SplitDirection.vertical, t("opening.dropDown.split.dropDown.vertical") as string)
					.setValue(this.plugin.settings.splitDefault)
					.onChange(async (value) => {
						this.plugin.settings.splitDefault = value as SplitDirection;
						await this.plugin.saveSettings();
					}));
		}
		
		new Setting(containerEl)
			.setName(t("focus.title") as string)
			.setDesc(t("focus.desc") as string)
			.addToggle(cb => cb
				.setValue(this.plugin.settings.focused)
				.onChange(async (value) => {
					this.plugin.settings.focused = value;
					await this.plugin.saveSettings();
				}));
		
		containerEl.createEl("h3", {text: t("title") as string});

		
		this.plugin.settings.folder.forEach((folder, index) => {
			new Setting(containerEl)
				.setClass("note-in-folder-setting")
				.addSearch((cb) => {
					new FolderSuggest(cb.inputEl);
					cb.setPlaceholder(t("example") as string);
					cb.setValue(this.plugin.settings.folder[index]);
					cb.onChange(async (value) => {
						if (this.plugin.settings.folder.includes(value)) {
							new Notice(t("error") as string);
							value = "";
							cb.setValue("");
						}
						this.plugin.addNewCommands(this.plugin.settings.folder[index], value);
						this.plugin.settings.folder[index] = value;
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
							this.plugin.addNewCommands(folderDeleted, undefined);
							this.display();
						}));
			
		});
		new Setting(containerEl)
			.addButton(cb => cb
				.setButtonText(t("add") as string)
				.onClick(() => {
					this.plugin.settings.folder.push("");
					this.display();
				}));
		
	}
}
