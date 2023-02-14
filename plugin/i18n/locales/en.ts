export default {
	title: "Folders",
	error: "This path is already in the list or not found",
	folderNotFound: "Folder not found",
	name : {
		template: {
			title: "Choose the way to name the note. The name will be incremented if the name already exists. Also, no need to add the extension.",
			dropDown: {
				date: {
					title: "Date",
					desc: "Valid format can be found ",
					here: "here",
					url: "https://momentjs.com/docs/#/displaying/format/",
					error: "Invalid date format, please use a valid format."
				},
				string: {
					title: "String",
					desc: "You can use any string name here."
				},
				folderName: "Folder Name",
			}
		},
		title: "Default Name",
	},
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
