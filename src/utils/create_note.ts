import i18next from "i18next";
import { App, getLinkpath,MarkdownView, normalizePath,Notice, Platform, TAbstractFile, TFile, TFolder, WorkspaceLeaf } from "obsidian";
import { DefaultOpening, FolderSettings, SplitDirection } from "src/interface";
import NoteInFolder from "src/main";

import { generateFileName, generateFileNameWithCurrent, isTemplaterNeeded, replaceVariables } from "./utils";

function scrollToPosition(app: App, parts: {
	path: string
	heading?: string
	block?: string
}) {
	const cache = app.metadataCache.getCache(parts.path);
	const view = app.workspace.getActiveViewOfType(MarkdownView);
	if (!view || !cache) return;
	// Get the corresponding position for the heading/block
	if (parts.heading) {
		const heading = cache.headings?.find(
			heading => heading.heading === parts.heading
		);
		if (heading) {
			view.editor.setCursor(heading.position.start.line);
		}
	} else if (parts.block) {
		const block = cache.blocks?.[parts.block];
		if (block) {
			view.editor.setCursor(block.position.start.line);
		}
	}
}

function getLinkParts(path: string, app: App): {
	path: string
	heading?: string
	block?: string
} {
	// Extract the #^block from the path
	const blockMatch = path.match(/\^(.*)$/);
	const block = blockMatch ? blockMatch[1] : undefined;
	// Remove the #^block
	path = path.replace(/(\^.*)$/, "");

	// Extract the #heading from the path
	const headingMatch = path.match(/#(.*)$/);
	const heading = headingMatch ? headingMatch[1] : undefined;
	// Remove the #heading
	path = path.replace(/(#.*)$/, "");

	return {
		path:
			app.metadataCache.getFirstLinkpathDest(
				getLinkpath(path),
				app.workspace.getActiveFile()?.path ?? ""
			)?.path ?? path,
		heading,
		block,
	};
}


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

function getLeafWithNote(app: App, file: TFile): undefined | WorkspaceLeaf {
	let openedLeaf: WorkspaceLeaf | undefined = undefined;
	app.workspace.iterateAllLeaves((leaf) => {
		// @ts-ignore
		const leafFile = leaf.view.file as TFile;
		if (leafFile?.path === file.path) {
			openedLeaf = leaf;
		}
	});
	return openedLeaf;
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
	const createdFilePath = normalizePath(`${currentFolder.path}/${defaultName}`);
	const file = app.vault.getAbstractFileByPath(createdFilePath);

	if (file instanceof TFile) {
		if (currentFolder.opening !== DefaultOpening.nothing) {
			//search if the file is already open to prevent opening it twice
			let leaf = getLeafWithNote(app, file);
			if (leaf) {
				leaf.openFile(file, { active: currentFolder.focused });
				scrollToPosition(app, getLinkParts(defaultName, app));
			} else {
				leaf = getOpening(app, currentFolder, currentFolder.opening, currentFolder.splitDefault) as WorkspaceLeaf;
				await leaf.openFile(file, { active: currentFolder.focused });
			}
		} else if (currentFolder.alreadyExistOpening.opening !== DefaultOpening.nothing) {
			//search if the file is already open to prevent opening it twice
			let leaf = getLeafWithNote(app, file);
			if (leaf) {
				leaf.openFile(file, { active: currentFolder.alreadyExistOpening.focused });
				scrollToPosition(app, getLinkParts(defaultName, app));
			} else {
				leaf = getOpening(app, currentFolder, currentFolder.alreadyExistOpening.opening, currentFolder.alreadyExistOpening.splitDefault);
				if (leaf) await leaf.openFile(file, { active: currentFolder.alreadyExistOpening.focused });
			}
		}
	} else if (!file) {
		const leaf = getOpening(app, currentFolder);
		if (leaf) {
			const newFile = await app.vault.create(createdFilePath, "");
			await leaf.openFile(newFile, { active: currentFolder.focused });
			await plugin.triggerTemplater(newFile, currentFolder);
			await focusInlineTitle(leaf, app);
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

export function createFolderInCurrent(newFolder: FolderSettings, currentFile: TAbstractFile, plugin: NoteInFolder) {
	const { settings,app } = plugin;
	const { folderPath, defaultName, hasBeenReplaced, currentFolder} = generateFileNameWithCurrent(newFolder, currentFile, plugin);
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
	if (file instanceof TFile) {
		if (currentFolder.opening !== DefaultOpening.nothing) {
			//search if the file is already open to prevent opening it twice
			let leaf = getLeafWithNote(app, file);
			if (leaf) {
				leaf.openFile(file, { active: currentFolder.focused });
				scrollToPosition(app, getLinkParts(defaultName, app));
			} else {
				leaf = getOpening(app, currentFolder, currentFolder.opening, currentFolder.splitDefault) as WorkspaceLeaf;
				leaf.openFile(file, { active: currentFolder.focused });
			}
		} else if (currentFolder.alreadyExistOpening.opening !== DefaultOpening.nothing) {
			//search if the file is already open to prevent opening it twice
			let leaf = getLeafWithNote(app, file);
			if (leaf) {
				leaf.openFile(file, { active: currentFolder.alreadyExistOpening.focused });
				scrollToPosition(app, getLinkParts(defaultName, app));
			} else {
				leaf = getOpening(app, currentFolder, currentFolder.alreadyExistOpening.opening, currentFolder.alreadyExistOpening.splitDefault);
				if (leaf) leaf.openFile(file, { active: currentFolder.alreadyExistOpening.focused });
			}
		}
	} else if (!file) {
		if (leaf) {
			leaf = leaf as WorkspaceLeaf;
			let timeout = 50;
			if (settings.timeOutForInlineTitle) {
				if (settings.timeOutForInlineTitle instanceof Object) {
					timeout = settings.timeOutForInlineTitle[Platform.isMobile ? "mobile" : "desktop"];
				} else if (typeof settings.timeOutForInlineTitle === "number") {
					timeout = settings.timeOutForInlineTitle;
				}
			}
			app.vault.create(createdFilePath, "").then((file) => {
				leaf?.openFile(file, { active: currentFolder.focused });
				plugin.triggerTemplater(file, currentFolder);
			});
			new Promise((resolve) => {
				setTimeout(() => {
					focusInlineTitle(leaf, app);
					resolve(undefined);
				}, timeout);
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

async function focusInlineTitle(leaf: WorkspaceLeaf | undefined, app: App) {
	if (!leaf) {
		return;
	}
	const titleContainerEl = leaf.view.containerEl.querySelector("div.inline-title");
	if (!titleContainerEl) {
		return;
	}
	let innerTitle = titleContainerEl;
	// @ts-ignore
	const frontmatterTitle = app.plugins.enabledPlugins.has("obsidian-front-matter-title-plugin");
	if (titleContainerEl.hasAttribute("ofmt-fake-id") && frontmatterTitle) { //plugin frontmattert title
		const innerTitleFMT = leaf.view.containerEl.querySelector("div.inline-title[ofmt-original-id]");
		if (innerTitleFMT?.hasAttribute("hidden")) {
			titleContainerEl.setAttribute("hidden", "");
			innerTitleFMT.removeAttribute("hidden");
			innerTitle = innerTitleFMT;
		}
	}
	// @ts-ignore
	await innerTitle.focus();
	window.getSelection()?.selectAllChildren(innerTitle);
	return;
}
