import {App, Modal, Notice, Setting, moment} from "obsidian";
import {t} from "./i18n";
import {DefaultOpening, FolderSettings, Position, SplitDirection, TemplateType} from "./interface";
import {tooltips} from "@codemirror/view";


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
	
	dateSettings(contentEl: HTMLElement) {
		const desc = document.createDocumentFragment();
		const title = t("template.dropDown.date.title") as string;
		desc.createEl("span", undefined, (span) => {
			span.innerText = t("template.dropDown.date.desc") as string;
			span.createEl("a", undefined, (a) => {
				a.innerText = t("template.dropDown.date.here") as string;
				a.href = t("template.date.url") as string;
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
						this.result.template.format = value as string;
						paramName?.controlEl.classList.remove("is-error");
					});
			});
		return paramName;
	}
	
	settingName(contentEl: HTMLElement, typeName: TemplateType) {
		let paramName: Setting | null = null;
		if (typeName !== TemplateType.none) {
			contentEl.createEl("h3", {text: t("header.template") as string});
			contentEl.createEl("p", {text: t("template.desc") as string});

			if (TemplateType.date === this.result.template.type) {
				paramName = this.dateSettings(contentEl);
			} else if (TemplateType.folderName === this.result.template.type) {
				this.result.template.format = this.result.path.split("/").pop() as string;
			}
			
			new Setting(contentEl)
				.setName(t("template.position.title") as string)
				.addDropdown(cb => {
					cb
						.addOption(Position.prepend, t("template.position.prepend") as string)
						.addOption(Position.append, t("template.position.append") as string)
						.setValue(this.result.template.position)
						.onChange((value) => {
							this.result.template.position = value as Position;
						});
				})
			
				.addText(cb => {
					cb.inputEl.style.width = "30%";
					cb.setPlaceholder(t("template.separator") as string);
					cb.setValue(this.result.template.separator);
					cb.onChange((value) => {
						this.result.template.separator = value as string;
					});
				});
		}
		return paramName;
	}
	
	settingSplit(opening: Setting, split: DefaultOpening) {
		if (split === DefaultOpening.split) {
			opening
				.addDropdown(cb => cb
					.addOption(SplitDirection.horizontal, t("opening.dropDown.split.dropDown.horizontal") as string)
					.addOption(SplitDirection.vertical, t("opening.dropDown.split.dropDown.vertical") as string)
					.setValue(this.result.splitDefault)
					.onChange(async (value) => {
						this.result.splitDefault = value as SplitDirection;
					}));
		}
	}
	
	
	onOpen() {
		const {contentEl} = this;
		contentEl.empty();
		contentEl.createEl("h2", {text: t("modal") as string});
		
		const fileNameSettings = new Setting(contentEl)
			.setName(t("fileName.title") as string)
			.setDesc(t("fileName.desc") as string)
			.addText(cb => {
				cb
					.setValue(this.result.fileName)
					.onChange((value) => {
						this.result.fileName = value.replace(".md", "") as string;
					});
			});
		
		new Setting(contentEl)
			.setName(t("template.title") as string)
			.addDropdown(cb => {
				cb
					.addOption(TemplateType.none, t("template.dropDown.none") as string)
					.addOption(TemplateType.date, t("template.dropDown.date.title") as string)
					.addOption(TemplateType.folderName, t("template.dropDown.folderName") as string)
					.setValue(this.result.template.type)
					.onChange((value) => {
						this.result.template.type = value as TemplateType;
						this.onOpen();
					});
			});
		const paramName = this.settingName(contentEl, this.result.template.type as TemplateType);
		
		contentEl.createEl("h2", {text: t("header.opening") as string});
		
		const opening = new Setting(contentEl)
			.setName(t("opening.title") as string)
			.setDesc(t("opening.desc") as string)
			.addDropdown(cb => {
				cb
					.addOption(DefaultOpening.newTab, t("opening.dropDown.newTab") as string)
					.addOption(DefaultOpening.current, t("opening.dropDown.current") as string)
					.addOption(DefaultOpening.newWindow, t("opening.dropDown.newWindow") as string)
					.addOption(DefaultOpening.split, t("opening.dropDown.split.title") as string)
					.setValue(this.result.opening)
					.onChange((value) => {
						this.result.opening = value as DefaultOpening;
						this.onOpen();
					});
			});
		this.settingSplit(opening, this.result.opening);

		new Setting(contentEl)
			.setName(t("focus.title") as string)
			.setDesc(t("focus.desc") as string)
			.addToggle(cb => cb
				.setValue(this.result.focused)
				.onChange(async (value) => {
					this.result.focused = value;
				}));
		
		new Setting(contentEl)
			.addButton(cb =>
				cb
					.setButtonText(t("submit") as string)
					.onClick(() => {
						if (this.result.template.type === TemplateType.none && this.result.fileName.trim().length === 0) {
							new Notice(t("fileName.error") as string);
							fileNameSettings.controlEl.classList.add("is-error");
						} else if (this.result.template.type === TemplateType.date && !moment(moment().format(this.result.template.format), this.result.template.format, true).isValid()) {
							new Notice(t("template.dropDown.date.error") as string);
							paramName?.controlEl.classList.add("is-error");
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
