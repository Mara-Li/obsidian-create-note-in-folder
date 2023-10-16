import i18next from "i18next";
import { Notice, TFile, WorkspaceLeaf } from "obsidian";
import { DefaultOpening, FolderSettings } from "src/interface";
import NoteInFolder from "src/main";

import { generateFileName, replaceVariables } from "./utils";

export async function createNoteInFolder(newFolder: FolderSettings, plugin: NoteInFolder, quickSwitcher = false) {
	const {settings, app} = plugin;
	const { path, hasBeenReplaced } = replaceVariables(newFolder.path, settings.customVariables);
	const currentFolder = JSON.parse(JSON.stringify(newFolder)) as FolderSettings;
	currentFolder.path = path.endsWith("/") ? path : `${path}/`;
	const folderPath = currentFolder.path !== "/" ? currentFolder.path.replace(/\/$/, "") : "/";
	currentFolder.path = currentFolder.path === "//" ? "/" : currentFolder.path;
	const defaultName = generateFileName(currentFolder, app);
	if (!app.vault.getAbstractFileByPath(folderPath)) {
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
	let leaf: WorkspaceLeaf;
	switch (currentFolder.opening) {
	case DefaultOpening.split:
		leaf = app.workspace.getLeaf("split", currentFolder.splitDefault);
		break;
	case DefaultOpening.newWindow:
		leaf = app.workspace.getLeaf("window");
		break;
	case DefaultOpening.newTab:
		leaf = app.workspace.getLeaf(true);
		break;
	default:
		leaf = app.workspace.getLeaf(false);
		break;
	}
	const file = app.vault.getAbstractFileByPath(`${currentFolder.path}${defaultName}`);
	if (file instanceof TFile) {
		await leaf.openFile(file, { active: currentFolder.focused });
	}
	if (!file) {
		const newFile = await app.vault.create(`${currentFolder.path}${defaultName}`, "");
		await leaf.openFile(newFile, { active: currentFolder.focused });
		await plugin.triggerTemplater(newFile, currentFolder);
	}
}

export function createFolderInCurrent(newFolder: FolderSettings, currentFile: TFile, plugin: NoteInFolder) {
	const { settings,app } = plugin;
	const { path, hasBeenReplaced } = replaceVariables(newFolder.path, settings.customVariables);
	const parent = currentFile.parent ? currentFile.parent.path : "/";
	const currentFolder = JSON.parse(JSON.stringify(newFolder)) as FolderSettings;
	currentFolder.path = path.replace("{{current}}", `${parent}/`);
	currentFolder.path = currentFolder.path === "//" ? "/" : currentFolder.path;
	const folderPath = currentFolder.path !== "/" ? currentFolder.path.replace(/\/$/, "") : "/";
	const defaultName = generateFileName(currentFolder, app);
	console.log(currentFolder);
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
	let leaf: WorkspaceLeaf;
	switch (currentFolder.opening) {
	case DefaultOpening.split:
		leaf = app.workspace.getLeaf("split", currentFolder.splitDefault);
		break;
	case DefaultOpening.newWindow:
		leaf = app.workspace.getLeaf("window");
		break;
	case DefaultOpening.newTab:
		leaf = app.workspace.getLeaf(true);
		break;
	default:
		leaf = app.workspace.getLeaf(false);
		break;
	}
	const file = app.vault.getAbstractFileByPath(`${currentFolder.path}${defaultName}`);
	if (file instanceof TFile) {
		leaf.openFile(file, { active: currentFolder.focused });
	}
	if (!file) {
		app.vault.create(`${currentFolder.path}${defaultName}`, "").then((file) => {
			leaf.openFile(file, { active: currentFolder.focused });
			plugin.triggerTemplater(file, currentFolder);
		});
	}
}