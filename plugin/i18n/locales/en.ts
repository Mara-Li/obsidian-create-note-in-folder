export default {
	title: "Folders",
	error: "This path is already in the list or not found",
	header: {
		template: "Template",
		opening: "Opening",
	},
	folderNotFound: "Folder not found",
	template: {
		title: "Choose a template if you want to add something before or after the filename.",
		dropDown: {
			date: {
				title: "Date",
				desc: "Valid format can be found ",
				here: "here",
				url: "https://momentjs.com/docs/#/displaying/format/",
				error: "Invalid date format, please use a valid format."
			},
			none: "None",
			folderName: "Folder Name",
		},
		position: {
			title: "Choose where to add the template.",
			prepend: "Prepend",
			append: "Append",
		},
		separator: "Separator",
	},
	fileName: "Choose how notes will be named. The name will be incremented if the name already exists. Also, no need to add the extension.",
	opening: {
		title: "Default Opening",
		desc: "How note will be opened after creation",
		dropDown: {
			newTab: "New Tab",
			current: "Current Tab",
			split: {
				title: "Split Pane",
				dropDown: {
					horizontal: "Horizontal",
					vertical: "Vertical",
				},
			},
			newWindow: "New Window",
		}
	},
	focus: {
		title: "Focus",
		desc: "Focus on the new note after creation"
	},
	example: "Example: path/to/path",
	remove: "Remove Folder",
	add: "Add Folder",
	modal: "Edit Folder specific settings",
	submit: "Submit",
};
