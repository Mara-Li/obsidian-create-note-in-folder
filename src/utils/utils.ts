import { App, moment, normalizePath } from "obsidian";

import { CustomVariables, FolderSettings, Position, TemplateType } from "../interface";


export function validateDate(date: string) {
	return moment(moment().format(date), date, true).isValid();
}

export function isTemplaterNeeded(app: App, settings: FolderSettings) {
	//@ts-ignore
	return app.plugins.enabledPlugins.has("templater-obsidian") && settings.templater;
}

/**
 * A function to generate the filename using the template settings & filename settings
 * @param folder {FolderSettings} The folder settings
 * @returns {string} The generated filename
 */
export function generateFileName(folder: FolderSettings, app: App): string {
	let defaultName = folder.fileName;
	defaultName = defaultName.replace(".md", "");
	const template = folder.template;
	const typeName = template.type;
	let generatedName = null;
	if (typeName === TemplateType.date) {
		if (template.format.trim().length === 0) {
			template.format = "YYYY-MM-DD";
		}
		generatedName = moment().format(template.format);
	} else if (typeName === TemplateType.folderName) {
		//remove the last / if it exists
		const folderPath = normalizePath(folder.path);
		generatedName = folderPath.split("/").pop();
	}
	if (template.position === Position.prepend && generatedName) {
		defaultName = generatedName + template.separator + defaultName;
	} else if (template.position === Position.append && generatedName) {
		defaultName = defaultName + template.separator + generatedName;
	}
	while (app.vault.getAbstractFileByPath(normalizePath(`${folder.path}/${defaultName}.md`)) && template.increment) {
		const increment = defaultName.match(/ \d+$/);
		const newIncrement = increment ? parseInt(increment[0]) + 1 : 1;
		defaultName = `${defaultName.replace(/ \d+$/, "")} ${newIncrement}`;
	}
	return `${defaultName}.md`;
}

export function replaceVariables(filePath: string, customVariables: CustomVariables[]) {
	const hasBeenReplaced: boolean[] = [];
	for (const variable of customVariables) {
		if (filePath.match(`{{${variable.name}}}`)) {
			if (variable.type === "string") {
				filePath = filePath.replace(`{{${variable.name}}}`, variable.value);
			} else {
				filePath = filePath.replace(`{{${variable.name}}}`, moment().format(variable.value));
			}
			hasBeenReplaced.push(true);
		} else if (variable.name.match(/^\/.+\/[gimy]*$/)) {
			const regex = new RegExp(variable.name.replace(/^\/(.+)\/[gimy]*$/, "{{$1}}"), variable.name.replace(/^\/.+\/([gimy]*)$/, "$1"));
			if (filePath.match(regex)) {
				filePath = filePath.replace(regex, variable.value);
				hasBeenReplaced.push(true);
			}
		}
	}
	return { path: filePath, hasBeenReplaced: hasBeenReplaced.length > 0 };
}