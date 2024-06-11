import i18next from "i18next";
import { AbstractInputSuggest, type App, Notice, TFile, TFolder } from "obsidian";

export class FolderSuggester extends AbstractInputSuggest<TFolder> {
	constructor(
		private inputEl: HTMLInputElement,
		app: App,
		private onSubmit: (value: TFolder) => void
	) {
		super(app, inputEl);
	}

	renderSuggestion(value: TFolder, el: HTMLElement): void {
		el.setText(value.path);
	}

	getSuggestions(query: string): TFolder[] {
		//@ts-ignore
		return this.app.vault.getAllFolders().filter((folder: TFolder) => {
			return folder.path.toLowerCase().contains(query.toLowerCase());
		});
	}

	selectSuggestion(value: TFolder, _evt: MouseEvent | KeyboardEvent): void {
		this.onSubmit(value);
		this.inputEl.value = value.path;
		this.inputEl.focus();
		this.inputEl.trigger("input");
		this.close();
	}
}

export class FileSuggester extends AbstractInputSuggest<TFile> {
	constructor(
		private inputEl: HTMLInputElement,
		app: App,
		private onSubmit: (value: TFile) => void
	) {
		super(app, inputEl);
	}

	renderSuggestion(value: TFile, el: HTMLElement): void {
		el.setText(value.path);
	}

	recursiveChildren(folder: TFolder): TFile[] {
		const files: TFile[] = [];
		folder.children.forEach((file) => {
			if (file instanceof TFile) {
				files.push(file);
			} else if (file instanceof TFolder) {
				files.push(...this.recursiveChildren(file));
			}
		});
		return files;
	}

	private errorMessages = i18next.t("template.error");

	getSuggestions(query: string): TFile[] {
		const templaterPlugin = this.app.plugins.getPlugin("templater-obsidian");
		if (!templaterPlugin) {
			new Notice(this.errorMessages);
			return [];
		}
		const templaterFolder = this.app.vault.getAbstractFileByPath(
			//@ts-ignore
			templaterPlugin.settings.templates_folder
		);
		if (!templaterFolder || !(templaterFolder instanceof TFolder)) {
			new Notice(this.errorMessages);
			return [];
		}

		const files: TFile[] = this.recursiveChildren(templaterFolder).filter(
			(file) =>
				file instanceof TFile &&
				file.extension === "md" &&
				file.path.toLowerCase().contains(query.toLowerCase())
		) as TFile[];
		return files;
	}

	selectSuggestion(value: TFile, _evt: MouseEvent | KeyboardEvent): void {
		this.onSubmit(value);
		this.inputEl.value = value.path;
		this.inputEl.focus();
		this.inputEl.trigger("input");
		this.close();
	}
}
