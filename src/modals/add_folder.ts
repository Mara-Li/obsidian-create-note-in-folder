import i18next from "i18next";
import { type App, Modal, Notice, Setting } from "obsidian";
import { validateDate } from "src/utils/utils";

import { FileSuggester } from "../fileSuggest";
import {
	DefaultOpening,
	type FolderSettings,
	Position,
	SplitDirection,
	TemplateType,
} from "../interface";

/**
 * Modal to add settings to a new folder
 */

export class AddFolderModal extends Modal {
	result: FolderSettings;
	defaultTemp: boolean;
	onSubmit: (result: FolderSettings) => void;

	constructor(
		app: App,
		actualFolder: FolderSettings,
		defaultTemp = false,
		onSubmit: (result: FolderSettings) => void
	) {
		super(app);
		this.result = actualFolder;
		this.onSubmit = onSubmit;
		this.defaultTemp = defaultTemp;
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
				a.innerText = i18next.t("template.dropDown.date.here");
				a.href = i18next.t("template.dropDown.date.url");
			});
		});
		const paramName = new Setting(contentEl)
			.setName(title)
			.setDesc(desc)
			.addText((cb) => {
				cb.setPlaceholder("YYYY-MM-DD")
					.setValue(this.result.template.format)
					.onChange((value) => {
						this.result.template.format = value;
						paramName?.controlEl.classList.remove("is-error");
					});
			});
		return paramName;
	}

	settingTemplater(contentEl: HTMLElement) {
		if (this.app.plugins.getPlugin("templater-obsidian")) {
			contentEl.createEl("h2", { text: i18next.t("editFolder.templater.title") });
			return new Setting(contentEl)
				.setName(i18next.t("editFolder.templater.setting.title"))
				.setDesc(i18next.t("editFolder.templater.setting.desc"))
				.addSearch((cb) => {
					cb.setValue(this.result.templater ?? "");
					new FileSuggester(cb.inputEl, this.app, (file) => {
						this.result.templater = file.path;
					});
					cb.setPlaceholder(i18next.t("editFolder.templater.setting.placeholder"));
				});
		}
		return null;
	}

	/**
	 * Settings for the template if TemplateType is not none
	 * Call settingsTemplateDate if TemplateType is date to create the setting for the date template
	 * @param contentEl {HTMLElement} - The content of the modal
	 * @param typeName {TemplateType} - The type of the template
	 * @param fileNameSetting {Setting} - The setting for the file name, allowing to add class to it if needed
	 * @returns {Setting | null} - The setting for the date template if TemplateType is date, null otherwise
	 */
	settingTemplate(
		contentEl: HTMLElement,
		typeName: TemplateType,
		fileNameSetting: Setting
	) {
		let paramName: Setting | null = null;
		if (typeName !== TemplateType.None) {
			fileNameSetting.setClass("create-note-in-folder");
			fileNameSetting.setClass("edit");
			fileNameSetting.setClass("is-facultative");
			fileNameSetting.setDesc(i18next.t("template.desc"));
			contentEl.createEl("h3", { text: i18next.t("template.header") });

			if (TemplateType.Date === this.result.template.type) {
				paramName = this.settingsTemplateDate(contentEl);
			} else if (TemplateType.FolderName === this.result.template.type) {
				this.result.template.format = this.result.path.split("/").pop() as string;
			}

			new Setting(contentEl)
				.setName(i18next.t("template.position.title"))
				.addDropdown((cb) => {
					cb.addOption(Position.Prepend, i18next.t("template.position.prepend"))
						.addOption(Position.Append, i18next.t("template.position.append"))
						.setValue(this.result.template.position)
						.onChange((value) => {
							this.result.template.position = value as Position;
						});
				})

				.addText((cb) => {
					cb.setPlaceholder(i18next.t("template.separator"));
					cb.setValue(this.result.template.separator);
					cb.onChange((value) => {
						this.result.template.separator = value;
					});
				});
		}
		return paramName;
	}

	/**
	 * Settings for the split if DefaultOpening is split
	 * @param settingComp {Setting} - The setting component to add the dropdown
	 * @param split {DefaultOpening} - The default opening
	 * @returns {void}
	 */
	settingSplit(
		settingComp: Setting,
		split: DefaultOpening,
		type: "default" | "exists" = "default"
	): void {
		const value =
			type === "default"
				? this.result.splitDefault
				: this.result.alreadyExistOpening.splitDefault;

		if (split === DefaultOpening.Split) {
			settingComp.addDropdown((cb) =>
				cb
					.addOption(
						SplitDirection.Horizontal,
						i18next.t("editFolder.opening.split.horizontal")
					)
					.addOption(
						SplitDirection.Vertical,
						i18next.t("editFolder.opening.split.vertical")
					)
					.setValue(value)
					.onChange(async (value) => {
						if (type === "default") this.result.splitDefault = value as SplitDirection;
						else this.result.alreadyExistOpening.splitDefault = value as SplitDirection;
					})
			);
		}
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClasses(["create-note-in-folder", "edit"]);
		if (!this.defaultTemp)
			contentEl.createEl("h2", { text: i18next.t("editFolder.title") });
		else contentEl.createEl("h2", { text: i18next.t("editFolder.default") });

		const fileNameSettings = new Setting(contentEl)
			.setName(i18next.t("editFolder.fileName.title"))
			.setDesc(i18next.t("editFolder.fileName.desc"))
			.addText((cb) => {
				cb.setValue(this.result.fileName).onChange((value) => {
					this.result.fileName = value.replace(".md", "");
				});
			});
		new Setting(contentEl)
			.setName(i18next.t("editFolder.increments.title"))
			.setDesc(i18next.t("editFolder.increments.desc"))
			.addToggle((cb) =>
				cb.setValue(this.result.template.increment ?? true).onChange(async (value) => {
					this.result.template.increment = value;
					this.onOpen();
				})
			);
		new Setting(contentEl)
			.setName(i18next.t("editFolder.template.title"))
			.addDropdown((cb) => {
				cb.addOption(TemplateType.None, i18next.t("editFolder.template.dropDown.none"))
					.addOption(TemplateType.Date, i18next.t("common.date"))
					.addOption(
						TemplateType.FolderName,
						i18next.t("editFolder.template.dropDown.folderName")
					)
					.setValue(this.result.template.type)
					.onChange((value) => {
						this.result.template.type = value as TemplateType;
						this.onOpen();
					});
			});
		const paramName = this.settingTemplate(
			contentEl,
			this.result.template.type as TemplateType,
			fileNameSettings
		);

		contentEl.createEl("h2", { text: i18next.t("editFolder.opening.head") });

		const opening = new Setting(contentEl)
			.setName(i18next.t("editFolder.opening.title"))
			.setDesc(i18next.t("editFolder.opening.desc"))
			.addDropdown((cb) => {
				cb.addOption(
					DefaultOpening.NewTab,
					i18next.t("editFolder.opening.dropDown.newTab")
				)
					.addOption(
						DefaultOpening.Current,
						i18next.t("editFolder.opening.dropDown.current")
					)
					.addOption(
						DefaultOpening.NewWindow,
						i18next.t("editFolder.opening.dropDown.newWindow")
					)
					.addOption(DefaultOpening.Split, i18next.t("editFolder.opening.dropDown.split"))
					.addOption(
						DefaultOpening.Nothing,
						i18next.t("editFolder.opening.dropDown.nothing")
					)
					.setValue(this.result.opening)
					.onChange((value) => {
						this.result.opening = value as DefaultOpening;
						this.onOpen();
					});
			});
		this.settingSplit(opening, this.result.opening);
		if (this.result.opening !== DefaultOpening.Nothing) {
			new Setting(contentEl)
				.setName(i18next.t("editFolder.focus.title"))
				.setDesc(i18next.t("editFolder.focus.desc"))
				.addToggle((cb) =>
					cb.setValue(this.result.focused).onChange(async (value) => {
						this.result.focused = value;
					})
				);
		} else if (
			!this.result.template.increment &&
			this.result.opening === DefaultOpening.Nothing
		) {
			contentEl.createEl("h3", { text: i18next.t("editFolder.opening.nothing") });
			contentEl.createEl("p", { text: i18next.t("editFolder.alreadyExist.desc") });
			const alreadyExist = this.result.alreadyExistOpening;
			const dp = new Setting(contentEl)
				.setName(i18next.t("editFolder.alreadyExist.title"))
				.addDropdown((cb) => {
					cb.addOption(
						DefaultOpening.NewTab,
						i18next.t("editFolder.opening.dropDown.newTab")
					)
						.addOption(
							DefaultOpening.Current,
							i18next.t("editFolder.opening.dropDown.current")
						)
						.addOption(
							DefaultOpening.NewWindow,
							i18next.t("editFolder.opening.dropDown.newWindow")
						)
						.addOption(
							DefaultOpening.Split,
							i18next.t("editFolder.opening.dropDown.split")
						)
						.setValue(this.result.alreadyExistOpening.opening as DefaultOpening)
						.onChange((value) => {
							this.result.alreadyExistOpening.opening = value as DefaultOpening;
							this.onOpen();
						});
				});
			this.settingSplit(dp, alreadyExist.opening, "exists");
			if (alreadyExist.opening !== DefaultOpening.Nothing) {
				new Setting(contentEl)
					.setName(i18next.t("editFolder.focus.title"))
					.setDesc(i18next.t("editFolder.alreadyExist.focus"))
					.addToggle((cb) =>
						cb.setValue(alreadyExist.focused).onChange(async (value) => {
							alreadyExist.focused = value;
						})
					);
			}
		}

		this.settingTemplater(contentEl);

		this.contentEl.createEl("h2", { text: i18next.t("editFolder.other.title") });

		new Setting(contentEl)
			.setName(i18next.t("editFolder.other.setting.title"))
			.setDesc(i18next.t("editFolder.other.setting.desc"))
			.setDisabled(!this.result.path.contains("{{current}}"))
			.addToggle((cb) =>
				cb.setValue(this.result.fileMenu).onChange(async (value) => {
					this.result.fileMenu = value;
				})
			);

		new Setting(contentEl).addButton((cb) =>
			cb.setButtonText(i18next.t("common.submit")).onClick(() => {
				if (
					this.result.template.type === TemplateType.None &&
					this.result.fileName.trim().length === 0
				) {
					new Notice(i18next.t("error.fileName"));
					fileNameSettings.controlEl.classList.add("is-error");
				} else if (
					this.result.template.type === TemplateType.Date &&
					!validateDate(this.result.template.format)
				) {
					new Notice(i18next.t("error.date"));
					paramName?.controlEl.classList.add("is-error");
				} else if (this.result.fileName.match(/[*"/\\<>:|?]+/)) {
					new Notice(i18next.t("error.invalidExpression"));
					fileNameSettings.controlEl.classList.add("is-error");
				} else {
					this.onSubmit(this.result);
					this.close();
				}
			})
		);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
