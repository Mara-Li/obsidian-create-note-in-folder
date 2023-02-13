import {App, PluginSettingTab, Setting} from "obsidian";
import NoteInFolder from "./main";
import {FolderSuggest} from "./fileSuggest";
import {DefaultOpening, SplitDirection} from "./interface";

export class NoteInFolderSettingsTab extends PluginSettingTab {
	plugin: NoteInFolder;
	
	constructor(app: App, plugin: NoteInFolder) {
		super(app, plugin);
		this.plugin = plugin;
	}
	
	display(): void {
		const {containerEl} = this;
		
		containerEl.empty();
		
		new Setting(containerEl)
			.setName("Default Name")
			.setDesc("Default name for new notes")
			.addText(cb => cb
				.setValue(this.plugin.settings.defaultName)
				.onChange(async (value) => {
					this.plugin.settings.defaultName = value;
					await this.plugin.saveSettings();
					this.display();
				}));
		
		

		

		
		const opening = new Setting(containerEl)
			.setName("Default Opening")
			.setDesc("Default opening for new notes")
			.addDropdown(cb => cb
				.addOption(DefaultOpening.newTab, "New Tab")
				.addOption(DefaultOpening.current, "Current Tab")
				.addOption(DefaultOpening.split, "Split Pane")
				.addOption(DefaultOpening.newWindow, "New Window")
				.setValue(this.plugin.settings.opening)
				.onChange(async (value) => {
					this.plugin.settings.opening = value as DefaultOpening;
					await this.plugin.saveSettings();
				}));
		
		if (this.plugin.settings.opening === DefaultOpening.split) {
			opening
				.addDropdown(cb => cb
					.addOption(SplitDirection.horizontal, "Horizontal")
					.addOption(SplitDirection.vertical, "Vertical")
					.setValue(this.plugin.settings.splitDefault)
					.onChange(async (value) => {
						this.plugin.settings.splitDefault = value as SplitDirection;
						await this.plugin.saveSettings();
					}));
		}
		
		new Setting(containerEl)
			.setName("Focus")
			.setDesc("Focus on the new note after creation")
			.addToggle(cb => cb
				.setValue(this.plugin.settings.focused)
				.onChange(async (value) => {
					this.plugin.settings.focused = value;
					await this.plugin.saveSettings();
				}));
		
		containerEl.createEl("h2", {text: "Note in Folder Settings"});
		this.plugin.settings.folder.forEach((folder, index) => {
			new Setting(containerEl)
				.setClass("note-in-folder-setting")
				.addSearch((cb) => {
					new FolderSuggest(cb.inputEl);
					cb.setPlaceholder("Example: path/to/folder");
					cb.setValue(this.plugin.settings.folder[index]);
					cb.onChange(async (value) => {
						this.plugin.settings.folder[index] = value;
						await this.plugin.saveSettings();
					});
				})
				.addButton(cb =>
					cb
						.setIcon("cross")
						.setTooltip("Remove Folder")
						.onClick(() => {
							this.plugin.settings.folder.splice(index, 1);
							this.display();
						}));
			
		});
		new Setting(containerEl)
			.addButton(cb => cb
				.setButtonText("Add Folder")
				.onClick(() => {
					this.plugin.settings.folder.push("");
					this.display();
				}));
		
	}
}
