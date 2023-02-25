import {App, Modal, Notice, Setting, moment} from "obsidian";
import i18next from "i18next";
import {DefaultOpening, FolderSettings, Position, SplitDirection, TemplateType} from "./interface";

/**
 * Modal to add settings to a new folder
 */

export class AddFolderModal extends Modal {
	result: FolderSettings;
	onSubmit: (result: FolderSettings) => void;
	
	constructor(app: App, actualFolder: FolderSettings, onSubmit: (result: FolderSettings) => void) {
		super(app);
		this.result = actualFolder;
		this.onSubmit = onSubmit;
	}
	
	/**
	 * Parameters for the date template
	 * @param contentEl {HTMLElement} - The content of the modal
	 * @returns {Setting} - The setting for the date template
	 */
	settingsTemplateDate(contentEl: HTMLElement) {
		const desc = document.createDocumentFragment();
		const title = i18next.t("template.dropDown.date.title");
		desc.createEl("span", undefined, (span) => {
			span.innerText = i18next.t("template.dropDown.date.desc");
			span.createEl("a", undefined, (a) => {
				a.innerText = i18next.t("template.dropDown.date.here") ;
				a.href = i18next.t("template.date.url") ;
			});
		});
		const paramName = new Setting(contentEl)
			.setName(title)
			.setDesc(desc)
			.addText(cb => {
				cb
					.setPlaceholder("YYYY-MM-DD")
					.setValue(this.result.template.format)
					.onChange((value) => {
						this.result.template.format = value ;
						paramName?.controlEl.classList.remove("is-error");
					});
			});
		return paramName;
	}
	
	/**
	 * Settings for the template if TemplateType is not none
	 * Call settingsTemplateDate if TemplateType is date to create the setting for the date template
	 * @param contentEl {HTMLElement} - The content of the modal
	 * @param typeName {TemplateType} - The type of the template
	 * @param fileNameSetting {Setting} - The setting for the file name, allowing to add class to it if needed
	 * @returns {Setting | null} - The setting for the date template if TemplateType is date, null otherwise
	 */
	settingTemplate(contentEl: HTMLElement, typeName: TemplateType, fileNameSetting: Setting) {
		let paramName: Setting | null = null;
		if (typeName !== TemplateType.none) {
			fileNameSetting.setClass("create-note-in-folder");
			fileNameSetting.setClass("edit");
			fileNameSetting.setClass("is-facultative");
			fileNameSetting.setDesc(i18next.t("template.desc") );
			contentEl.createEl("h3", {text: i18next.t("header.template") as string});
			contentEl.createEl("p", {text: i18next.t("template.desc") as string});

			if (TemplateType.date === this.result.template.type) {
				paramName = this.settingsTemplateDate(contentEl);
			} else if (TemplateType.folderName === this.result.template.type) {
				this.result.template.format = this.result.path.split("/").pop() as string;
			}
			
			new Setting(contentEl)
				.setName(i18next.t("template.position.title") as string)
				.addDropdown(cb => {
					cb
						.addOption(Position.prepend, i18next.t("template.position.prepend") as string)
						.addOption(Position.append, i18next.t("template.position.append") as string)
						.setValue(this.result.template.position)
						.onChange((value) => {
							this.result.template.position = value as Position;
						});
				})
			
				.addText(cb => {
					cb.inputEl.style.width = "30%";
					cb.setPlaceholder(i18next.t("template.separator") );
					cb.setValue(this.result.template.separator);
					cb.onChange((value) => {
						this.result.template.separator = value ;
					});
				});
		}
		return paramName;
	}
	
	/**
	 * Settings for the split if DefaultOpening is split
	 * @param opening {Setting} - The setting for the default opening
	 * @param split {DefaultOpening} - The default opening
	 * @returns {void}
	 */
	settingSplit(opening: Setting, split: DefaultOpening) {
		if (split === DefaultOpening.split) {
			opening
				.addDropdown(cb => cb
					.addOption(SplitDirection.horizontal, i18next.t("opening.dropDown.split.dropDown.horizontal") as string)
					.addOption(SplitDirection.vertical, i18next.t("opening.dropDown.split.dropDown.vertical") as string)
					.setValue(this.result.splitDefault)
					.onChange(async (value) => {
						this.result.splitDefault = value as SplitDirection;
					}));
		}
	}
	
	
	onOpen() {
		const {contentEl} = this;
		contentEl.empty();
		contentEl.createEl("h2", {text: i18next.t("modal") as string});
		
		const fileNameSettings = new Setting(contentEl)
			.setName(i18next.t("fileName.title") as string)
			.setDesc(i18next.t("fileName.desc") as string)
			.addText(cb => {
				cb
					.setValue(this.result.fileName)
					.onChange((value) => {
						this.result.fileName = value.replace(".md", "") ;
					});
			});
		
		new Setting(contentEl)
			.setName(i18next.t("template.title") as string)
			.addDropdown(cb => {
				cb
					.addOption(TemplateType.none, i18next.t("template.dropDown.none") as string)
					.addOption(TemplateType.date, i18next.t("template.dropDown.date.title") as string)
					.addOption(TemplateType.folderName, i18next.t("template.dropDown.folderName") as string)
					.setValue(this.result.template.type)
					.onChange((value) => {
						this.result.template.type = value as TemplateType;
						this.onOpen();
					});
			});
		const paramName = this.settingTemplate(contentEl, this.result.template.type as TemplateType, fileNameSettings);
		
		contentEl.createEl("h2", {text: i18next.t("header.opening") as string});
		
		const opening = new Setting(contentEl)
			.setName(i18next.t("opening.title") as string)
			.setDesc(i18next.t("opening.desc") as string)
			.addDropdown(cb => {
				cb
					.addOption(DefaultOpening.newTab, i18next.t("opening.dropDown.newTab") as string)
					.addOption(DefaultOpening.current, i18next.t("opening.dropDown.current") as string)
					.addOption(DefaultOpening.newWindow, i18next.t("opening.dropDown.newWindow") as string)
					.addOption(DefaultOpening.split, i18next.t("opening.dropDown.split.title") as string)
					.setValue(this.result.opening)
					.onChange((value) => {
						this.result.opening = value as DefaultOpening;
						this.onOpen();
					});
			});
		this.settingSplit(opening, this.result.opening);

		new Setting(contentEl)
			.setName(i18next.t("focus.title") as string)
			.setDesc(i18next.t("focus.desc") as string)
			.addToggle(cb => cb
				.setValue(this.result.focused)
				.onChange(async (value) => {
					this.result.focused = value;
				}));
		
		new Setting(contentEl)
			.addButton(cb =>
				cb
					.setButtonText(i18next.t("submit"))
					.onClick(() => {
						if (this.result.template.type === TemplateType.none && this.result.fileName.trim().length === 0) {
							new Notice(i18next.t("fileName.error"));
							fileNameSettings.controlEl.classList.add("is-error");
							fileNameSettings.controlEl.classList.add("edit");
							fileNameSettings.controlEl.classList.add("create-note-in-folder");
						} else if (this.result.template.type === TemplateType.date && !moment(moment().format(this.result.template.format), this.result.template.format, true).isValid()) {
							new Notice(i18next.t("template.dropDown.date.error"));
							paramName?.controlEl.classList.add("is-error");
							paramName?.controlEl.classList.add("edit");
							paramName?.controlEl.classList.add("create-note-in-folder");
						} else {
							this.onSubmit(this.result);
							this.close();
						}
					}));
	}
	
	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
