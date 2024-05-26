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
		const folders: TFolder[] = [];
		this.app.vault.getAllLoadedFiles().forEach((folder) => {
			if (folder instanceof TFolder && folder.path.contains(query.toLowerCase())) {
				folders.push(folder);
			}
		});
		return folders;
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
		const files: TFile[] = templaterFolder.children.filter(
			(file) =>
				file instanceof TFile &&
				file.extension === "md" &&
				file.path.contains(query.toLowerCase())
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
