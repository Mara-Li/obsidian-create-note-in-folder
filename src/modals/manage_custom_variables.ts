import i18next from "i18next";
import { App, Modal, Notice, Setting } from "obsidian";
import { CustomVariables } from "src/interface";
import { validateDate } from "src/utils/utils";

export class ManageCustomVariables extends Modal {
	result: CustomVariables[];
	onSubmit: (result: CustomVariables[]) => void;

	constructor(app: App, actualVariables: CustomVariables[], onSubmit: (result: CustomVariables[]) => void) {
		super(app);
		this.result = actualVariables;
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClasses(["create-note-in-folder", "manage"]);
		contentEl.createEl("h2", { text: i18next.t("variable.title") });
		const p = contentEl.createEl("p", { text: i18next.t("variable.desc.filename") });
		p.createEl("ul", undefined, (ul) => {
			ul.createEl("li", { text: i18next.t("variable.desc.explain") });
			const reg = ul.createEl("li", { text: i18next.t("variable.desc.regex.info") });
			const pReg = reg.createEl("p", { text: `${i18next.t("common.example")} ` });
			pReg.createEl("code", { text: "/\\d+-\\d+/gi" });
			pReg.addClass("list");
			ul.createEl("li", { text: i18next.t("variable.desc.regex.warn") });
			ul.createEl("li", { text: i18next.t("variable.desc.insensitive") });
		});
		contentEl.createEl("p", undefined, (p) => {
			p.createEl("p", { text: `⚠️ ${i18next.t("variable.desc.warn.usage")}`, cls: "callout-title" });
			p.createEl("p", undefined, (pWarn) => {
				pWarn.createEl("span", { text: i18next.t("common.example") });
				pWarn.createEl("span", { text: " ", cls: "code" });
				pWarn.createEl("code", { text: "MyFolder/{{month}}/{{date}}.md", cls: "code" });
			});
		}).addClass("is-warning");
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
			new Setting(contentEl)
				.setClass("no-display")
				.setClass("custom-variables")
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
		const { contentEl } = this;
		contentEl.empty();
	}

	validateEntry() {
		const wrongResultIndex: {
			"type": "name" | "value",
			"index": number
		}[] = [];
		if (this.result.some((custom) => custom.name.trim().length === 0)) {
			const translation = i18next.t("common.name");
			new Notice(i18next.t("error.empty", { name: translation }));
			wrongResultIndex.push({
				"type": "name",
				"index": this.result.findIndex((custom) => custom.name.trim().length === 0)
			});
		}
		if (this.result.some((custom) => custom.value.trim().length === 0)) {
			const translation = i18next.t("common.value");
			new Notice(i18next.t("error.empty", { name: translation }));
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
			new Notice(i18next.t("error.duplicate", { name: duplicated }));
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