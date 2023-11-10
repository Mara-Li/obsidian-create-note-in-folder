import i18next from "i18next";
import { App, normalizePath,Notice, TFile, TFolder, WorkspaceLeaf } from "obsidian";
import { DefaultOpening, FolderSettings, SplitDirection } from "src/interface";
import NoteInFolder from "src/main";

import { generateFileName, isTemplaterNeeded, replaceVariables } from "./utils";

function getOpening(app: App, currentFolder: FolderSettings, param: DefaultOpening = currentFolder.opening, split: SplitDirection = currentFolder.splitDefault) {
	switch (param) {
	case DefaultOpening.split:
		return app.workspace.getLeaf("split", split);
	case DefaultOpening.newWindow:
		return app.workspace.getLeaf("window");
	case DefaultOpening.newTab:
		return app.workspace.getLeaf(true);
	case DefaultOpening.nothing:
		return undefined;
	default:
		return app.workspace.getLeaf(false);
	}
}

export async function createNoteInFolder(newFolder: FolderSettings, plugin: NoteInFolder, quickSwitcher = false) {
	const {settings, app} = plugin;
	const { path, hasBeenReplaced } = replaceVariables(newFolder.path, settings.customVariables);
	const currentFolder = JSON.parse(JSON.stringify(newFolder)) as FolderSettings;
	currentFolder.path = normalizePath(path);
	const defaultName = generateFileName(currentFolder, app);
	if (!app.vault.getAbstractFileByPath(currentFolder.path)) {
		if (hasBeenReplaced) {
			//create folder if it doesn't exist
			await app.vault.createFolder(currentFolder.path);
		} else if (!quickSwitcher) {
			new Notice(i18next.t("error.pathNoFound", { path: newFolder.path }));
			//remove from settings
			settings.folder = settings.folder.filter((folder) => folder.commandName !== currentFolder.commandName);
			await plugin.saveSettings();
			await plugin.addNewCommands(currentFolder.commandName, undefined);
			return;
		}
	}
	console.log(i18next.t("log", { path: currentFolder.path, name: defaultName }));
	let leaf = getOpening(app, currentFolder);
	const createdFilePath = normalizePath(`${currentFolder.path}/${defaultName}`);
	const file = app.vault.getAbstractFileByPath(createdFilePath);
	if (leaf && file instanceof TFile) {
		await leaf.openFile(file, { active: currentFolder.focused });
	} else if (!leaf && file instanceof TFile && currentFolder.alreadyExistOpening.opening !== DefaultOpening.nothing) {
		leaf = getOpening(app, currentFolder, currentFolder.alreadyExistOpening.opening, currentFolder.alreadyExistOpening.splitDefault);
		if (leaf) await leaf.openFile(file, { active: currentFolder.alreadyExistOpening.focused });
	} else if (!file) {
		if (leaf) {
			const newFile = await app.vault.create(createdFilePath, "");
			await leaf.openFile(newFile, { active: currentFolder.focused });
			await plugin.triggerTemplater(newFile, currentFolder);
		} else if (isTemplaterNeeded(app, currentFolder)) {
			//directly templater to create and templating the things
			const templateFile = this.app.vault.getAbstractFileByPath(currentFolder.templater);
			if (!templateFile || !(templateFile instanceof TFile)) {
				new Notice(i18next.t("error.templateNotFound", { path: currentFolder.templater }));
				return;
			}
			const folder = app.vault.getAbstractFileByPath(normalizePath(currentFolder.path)) as TFolder;
			//@ts-ignore
			app.plugins.plugins["templater-obsidian"].templater.create_new_note_from_template(templateFile, folder, defaultName, false);
		} else {
			await app.vault.create(createdFilePath, "");
		}
	}
}

export function createFolderInCurrent(newFolder: FolderSettings, currentFile: TFile, plugin: NoteInFolder) {
	const { settings,app } = plugin;
	const { path, hasBeenReplaced } = replaceVariables(newFolder.path, settings.customVariables);
	const parent = currentFile.parent ? currentFile.parent.path : "/";
	const currentFolder = JSON.parse(JSON.stringify(newFolder)) as FolderSettings;
	currentFolder.path = path.replace("{{current}}", `${parent}/`);
	const folderPath = normalizePath(currentFolder.path);
	const defaultName = generateFileName(currentFolder, app);
	if (!app.vault.getAbstractFileByPath(folderPath)) {
		if (hasBeenReplaced) {
			//create folder if it doesn't exist
			app.vault.createFolder(currentFolder.path);
		} else {
			new Notice(i18next.t("error.pathNoFound", { path: currentFolder.path }));
			return;
		}
	}
	console.log(i18next.t("log", { path: currentFolder.path, name: defaultName }));
	let leaf = getOpening(app, currentFolder);

	const createdFilePath = normalizePath(`${currentFolder.path}/${defaultName}`);
	const file = app.vault.getAbstractFileByPath(createdFilePath);
	if (leaf && file instanceof TFile) {
		leaf.openFile(file, { active: currentFolder.focused });
	} else if (!leaf && file instanceof TFile && currentFolder.alreadyExistOpening.opening !== DefaultOpening.nothing) {
		console.log(`open ${file.name} in ${currentFolder.alreadyExistOpening}`);
		leaf = getOpening(app, currentFolder, currentFolder.alreadyExistOpening.opening);
		if (leaf) leaf.openFile(file, { active: currentFolder.alreadyExistOpening.focused });
	} else if (!file) {
		if (leaf) {
			leaf = leaf as WorkspaceLeaf;
			app.vault.create(createdFilePath, "").then((file) => {
				leaf?.openFile(file, { active: currentFolder.focused });
				plugin.triggerTemplater(file, currentFolder);
			});
		} else if (isTemplaterNeeded(app, currentFolder)) {
			//directly templater to create and templating the things
			const templateFile = app.vault.getAbstractFileByPath(currentFolder.templater ?? "");
			if (!templateFile || !(templateFile instanceof TFile)) {
				new Notice(i18next.t("error.templateNotFound", { path: currentFolder.templater }));
				return;
			}
			const folder = app.vault.getAbstractFileByPath(normalizePath(currentFolder.path)) as TFolder;
			//@ts-ignore
			app.plugins.plugins["templater-obsidian"].templater.create_new_note_from_template(templateFile, folder, defaultName, false);
		} else {
			app.vault.create(createdFilePath, "");
		}
	}
}