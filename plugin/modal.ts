import {App, Modal, Notice, Setting, moment} from "obsidian";
import {t} from "./i18n";
import {DefaultOpening, FolderSettings, SplitDirection, TypeName} from "./interface";


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
	
	settingName(contentEl: HTMLElement, typeName: TypeName) {
		let paramName: Setting | null;
		if (typeName !== TypeName.folderName) {
			const desc= document.createDocumentFragment();
			const title = t("name.template.dropDown." + typeName + ".title") as string;
			if (TypeName.date === this.result.typeName) {
				desc.createEl("span", undefined, (span) => {
					span.innerText = t("name.template.dropDown.date.desc") as string;
					span.createEl("a", undefined, (a) => {
						a.innerText = t("name.template.dropDown.date.here") as string;
						a.href = t("name.template.date.url") as string;
					});
				});
			} else {
				desc.createEl("span", undefined, (span) => {
					span.innerText = t("name.template.dropDown.string.desc") as string;
				});
			}
			paramName = new Setting(contentEl)
				.setName(title)
				.setDesc(desc)
				.addText(cb => {
					cb
						.setValue(this.result.formatName)
						.onChange((value) => {
							this.result.formatName = value as string;
							paramName?.controlEl.classList.remove("is-error");
						});
				});
		} else {
			this.result.formatName = this.result.path.split("/").pop() as string;
			paramName = null;
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
		
		new Setting(contentEl)
			.setName(t("name.template.title") as string)
			.addDropdown(cb => {
				cb
					.addOption(TypeName.string, t("name.template.dropDown.string.title") as string)
					.addOption(TypeName.date, t("name.template.dropDown.date.title") as string)
					.addOption(TypeName.folderName, t("name.template.dropDown.folderName") as string)
					.setValue(this.result.typeName)
					.onChange((value) => {
						this.result.typeName = value as TypeName;
						this.onOpen();
					});
			});
		const paramName = this.settingName(contentEl, this.result.typeName);
		
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
						if (this.result.typeName === TypeName.date) {
							const date = moment(moment().format(this.result.formatName), this.result.formatName, true).isValid();
							if (!date) {
								new Notice(t("name.template.dropDown.date.error") as string);
								paramName?.controlEl.classList.add("is-error");
							} else {
								this.onSubmit(this.result);
								this.close();
							}
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
