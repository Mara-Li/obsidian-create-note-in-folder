import i18next from "i18next";
import {App, Modal, moment,Notice, Setting} from "obsidian";

import {CustomVariables,DefaultOpening, FolderSettings, Position, SplitDirection, TemplateType} from "./interface";


function validateDate(date: string) {
	return moment(moment().format(date), date, true).isValid();
}
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
		const title = i18next.t("common.date");
		desc.createEl("span", undefined, (span) => {
			span.innerText = i18next.t("template.dropDown.date.desc");
			span.createEl("a", undefined, (a) => {
				a.innerText = i18next.t("template.dropDown.date.here") ;
				a.href = i18next.t("template.dropDown.date.url") ;
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
			fileNameSetting.setDesc(i18next.t("template.desc"));
			contentEl.createEl("h3", {text: i18next.t("template.header")});

			if (TemplateType.date === this.result.template.type) {
				paramName = this.settingsTemplateDate(contentEl);
				
			} else if (TemplateType.folderName === this.result.template.type) {
				this.result.template.format = this.result.path.split("/").pop() as string;
			}
			
			new Setting(contentEl)
				.setName(i18next.t("template.position.title"))
				.addDropdown(cb => {
					cb
						.addOption(Position.prepend, i18next.t("template.position.prepend"))
						.addOption(Position.append, i18next.t("template.position.append"))
						.setValue(this.result.template.position)
						.onChange((value) => {
							this.result.template.position = value as Position;
						});
				})
			
				.addText(cb => {
					cb.inputEl.style.width = "30%";
					cb.setPlaceholder(i18next.t("template.separator"));
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
					.addOption(SplitDirection.horizontal, i18next.t("editFolder.opening.split.horizontal"))
					.addOption(SplitDirection.vertical, i18next.t("editFolder.opening.split.vertical"))
					.setValue(this.result.splitDefault)
					.onChange(async (value) => {
						this.result.splitDefault = value as SplitDirection;
					}));
		}
	}
	
	
	onOpen() {
		const {contentEl} = this;
		contentEl.empty();
		contentEl.createEl("h2", {text: i18next.t("editFolder.title")});
		
		const fileNameSettings = new Setting(contentEl)
			.setName(i18next.t("editFolder.fileName.title"))
			.setDesc(i18next.t("editFolder.fileName.desc"))
			.addText(cb => {
				cb
					.setValue(this.result.fileName)
					.onChange((value) => {
						this.result.fileName = value.replace(".md", "") ;
					});
			});
		new Setting(contentEl)
			.setName(i18next.t("editFolder.increments.title"))
			.setDesc(i18next.t("editFolder.increments.desc"))
			.addToggle(cb => cb
				.setValue(this.result.template.increment ?? true)
				.onChange(async (value) => {
					this.result.template.increment = value;
				}));
		new Setting(contentEl)
			.setName(i18next.t("editFolder.template.title"))
			.addDropdown(cb => {
				cb
					.addOption(TemplateType.none, i18next.t("editFolder.template.dropDown.none"))
					.addOption(TemplateType.date, i18next.t("common.date"))
					.addOption(TemplateType.folderName, i18next.t("editFolder.template.dropDown.folderName"))
					.setValue(this.result.template.type)
					.onChange((value) => {
						this.result.template.type = value as TemplateType;
						this.onOpen();
					});
			});
		const paramName = this.settingTemplate(contentEl, this.result.template.type as TemplateType, fileNameSettings);
		
		contentEl.createEl("h2", {text: i18next.t("editFolder.opening.head")});
		
		const opening = new Setting(contentEl)
			.setName(i18next.t("editFolder.opening.title"))
			.setDesc(i18next.t("editFolder.opening.desc"))
			.addDropdown(cb => {
				cb
					.addOption(DefaultOpening.newTab, i18next.t("editFolder.opening.dropDown.newTab"))
					.addOption(DefaultOpening.current, i18next.t("editFolder.opening.dropDown.current"))
					.addOption(DefaultOpening.newWindow, i18next.t("editFolder.opening.dropDown.newWindow"))
					.addOption(DefaultOpening.split, i18next.t("editFolder.opening.dropDown.split"))
					.setValue(this.result.opening)
					.onChange((value) => {
						this.result.opening = value as DefaultOpening;
						this.onOpen();
					});
			});
		this.settingSplit(opening, this.result.opening);

		new Setting(contentEl)
			.setName(i18next.t("editFolder.focus.title"))
			.setDesc(i18next.t("editFolder.focus.desc"))
			.addToggle(cb => cb
				.setValue(this.result.focused)
				.onChange(async (value) => {
					this.result.focused = value;
				}));
		
		new Setting(contentEl)
			.addButton(cb =>
				cb
					.setButtonText(i18next.t("common.submit"))
					.onClick(() => {
						if (this.result.template.type === TemplateType.none && this.result.fileName.trim().length === 0) {
							new Notice(i18next.t("error.fileName"));
							fileNameSettings.controlEl.classList.add("is-error", "edit", "create-note-in-folder");
						} else if ((this.result.template.type === TemplateType.date) && !validateDate(this.result.template.format)) {
							new Notice(i18next.t("error.date"));
							paramName?.controlEl.classList.add("is-error", "edit", "create-note-in-folder");
						} else if (this.result.fileName.match(/[*"/\\<>:|?]+/)) {
							new Notice(i18next.t("error.invalidExpression"));
							fileNameSettings.controlEl.classList.add("is-error", "edit", "create-note-in-folder");
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

export class ManageCustomVariables extends Modal {
	result: CustomVariables[];
	onSubmit: (result: CustomVariables[]) => void;
	
	constructor(app: App, actualVariables: CustomVariables[], onSubmit: (result: CustomVariables[]) => void) {
		super(app);
		this.result = actualVariables;
		this.onSubmit = onSubmit;
	}
	
	onOpen() {
		const {contentEl} = this;
		contentEl.empty();
		contentEl.createEl("h2", {text: i18next.t("variable.title")});
		const p = contentEl.createEl("p", {text: i18next.t("variable.desc.filename")});
		p.createEl("ul", undefined, (ul) => {
			ul.createEl("li", {text: i18next.t("variable.desc.explain")});
			const reg = ul.createEl("li", {text: i18next.t("variable.desc.regex.info")});
			const pReg = reg.createEl("p", {text: `${i18next.t("common.example")} `});
			pReg.createEl("code", {text: "/\\d+-\\d+/gi"}).addClass("create-note-in-folder");
			pReg.addClass("list", "create-note-in-folder");
			ul.createEl("li", {text: i18next.t("variable.desc.regex.warn")} );
			ul.createEl("li", {text: i18next.t("variable.desc.insensitive")});
		});
		contentEl.createEl("p", undefined, (p) => {
			p.createEl("p", {text: "⚠️ " + i18next.t("variable.desc.warn.usage"), cls: "title"});
			p.createEl("p", undefined, (pWarn) => {
				pWarn.createEl("span", {text: i18next.t("common.example")});
				pWarn.createEl("span", {text: " ", cls: "code"});
				pWarn.createEl("code", {text: "MyFolder/{{month}}/{{date}}.md", cls: "code"});
			});
		}).addClass("create-note-in-folder", "is-warning");
		new Setting(contentEl)
			.addButton(cb =>
				cb
					.setButtonText(i18next.t("variable.add"))
					.onClick(() => {
						this.result.push({
							name: "",
							value: "",
							type: "string"
						});
						this.onOpen();
					}));
		
		for (const custom of this.result) {
			const settings = new Setting(contentEl)
				.setClass("manage-custom-variables")
				.addText(cb => {
					cb
						.setPlaceholder(i18next.t("variable.name"))
						.setValue(custom.name)
						.onChange((value) => {
							custom.name = value;
						});
				})
				.addDropdown(cb => {
					cb
						.addOption("string", i18next.t("common.string"))
						.addOption("date", i18next.t("common.date"))
						.setValue(custom.type)
						.onChange((value) => {
							custom.type = value as "string" | "date";
						});
				})
				.addText(cb => {
					cb
						.setPlaceholder(i18next.t("variable.value"))
						.setValue(custom.value)
						.onChange((value) => {
							custom.value = value;
						});
				})
				.addExtraButton(cb => {
					cb.setIcon("cross")
						.setTooltip(i18next.t("variable.remove"))
						.onClick(() => {
							this.result.splice(this.result.indexOf(custom), 1);
							this.onOpen();
						});
				});
			settings.infoEl.style.display = "none";
			const input = settings.controlEl.querySelectorAll("input");
			if (input) {
				input.forEach((input) => {
					input.style.width = "100%";
				});
			}
			const select = settings.controlEl.querySelectorAll("select");
			if (select) {
				select.forEach((select) => {
					select.style.width = "25%";
				});
			}
		}
		new Setting(contentEl)
			.addButton(cb =>
				cb
					.setButtonText(i18next.t("common.submit"))
					.onClick(() => {
						this.addErrorClass();
					}));
	}
	
	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
	
	validateEntry() {
		const wrongResultIndex: {
			"type" : "name" | "value",
			"index": number
		}[] = [];
		if (this.result.some((custom) => custom.name.trim().length === 0)) {
			const translation = i18next.t("common.name");
			new Notice(i18next.t("error.empty", {name: translation}));
			wrongResultIndex.push({
				"type": "name",
				"index": this.result.findIndex((custom) => custom.name.trim().length === 0)
			});
		}
		if (this.result.some((custom) => custom.value.trim().length === 0)) {
			const translation = i18next.t("common.value");
			new Notice(i18next.t("error.empty", {name: translation}));
			wrongResultIndex.push({
				"type": "value",
				"index": this.result.findIndex((custom) => custom.value.trim().length === 0)
			});
		}
		/** validate date **/
		if (this.result.some((custom) => custom.type === "date" && !validateDate(custom.value))) {
			new Notice(i18next.t("error.date"));
			wrongResultIndex.push({
				"type": "value",
				"index": this.result.findIndex((custom) => custom.type === "date" && !validateDate(custom.value))
			});
		}
		const duplicate = this.result
			.map((custom) => custom.name)
			.filter((value, index, self) => self.indexOf(value) !== index);
		if (duplicate.length !== 0) {
			//search each duplicated name for the notice, and set it into a list
			const duplicatedName = duplicate.map((name) => {
				const index = this.result.findIndex((custom) => custom.name === name);
				return this.result[index];
			});
			const duplicated = duplicatedName.map((custom) => custom.name).join(", ");
			new Notice(i18next.t("error.duplicate", {name: duplicated}));
			for (const name of duplicate) {
				wrongResultIndex.push({
					"type": "name",
					"index": this.result.findIndex((custom) => custom.name === name)
				});
			}
		}
		return wrongResultIndex;
	}
	
	addErrorClass() {
		const wrongResultIndex = this.validateEntry();
		console.log(wrongResultIndex);
		if (wrongResultIndex.length === 0) {
			//reload
			this.onOpen();
			this.onSubmit(this.result);
			this.close();
		}
		this.onOpen();
		for (const index of wrongResultIndex) {
			const resIndex = index.index < 0 ? 0 : index.index;
			const setting = this.contentEl.getElementsByClassName("manage-custom-variables")[resIndex];
			const type = index.type;
			if (type === "name") {
				//get first input of setting
				const input = setting.getElementsByTagName("input")[0];
				input.classList.add("is-error", "edit", "create-note-in-folder");
			} if (type === "value") {
				//get second input of setting
				const input = setting.getElementsByTagName("input")[1];
				input.classList.add("is-error", "edit", "create-note-in-folder");
			}
		}
	}
}
