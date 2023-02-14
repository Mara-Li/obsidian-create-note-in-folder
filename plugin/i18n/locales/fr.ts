export default {
	title: "Dossiers",
	error: "Ce dossier est déjà dans la liste ou n'existe pas.",
	folderNotFound: "Dossier introuvable",
	name : {
		template: {
			title: "Choisissez la façon dont les notes seront nommées. Le nom sera incrémenté si le nom existe déjà. De plus, pas besoin d'ajouter l'extension.",
			dropDown: {
				date: {
					title: "Date",
					desc: "Les formats valides peuvent être trouvés ",
					here: "ici",
					url: "https://momentjs.com/docs/#/displaying/format/",
					error: "Format de date invalide, veuillez utiliser un format valide."

				},
				string: {
					title: "Chaîne de caractères",
					desc: "Vous pouvez utiliser n'importe quelle chaîne de caractères ici."
				},
				folderName: "Nom du dossier",
			}
		},
		title: "Nom par défaut",
	},
	opening: {
		
		title: "Ouverture par défaut",
		desc: "Comment la note sera ouverte après sa création",
		dropDown: {
			newTab: "Nouvel onglet",
			current: "Onglet courant",
			split: {
				title: "Fenêtre divisée",
				dropDown: {
					horizontal: "Horizontale",
					vertical: "Verticale",
				},
			},
			newWindow: "Nouvelle fenêtre",
		},
	},
	focus: {
		title: "Focus",
		desc: "Focus sur la nouvelle note après sa création"
	},
	example: "Exemple: chemin/vers/dossier",
	remove: "Supprimer le dossier",
	add: "Ajouter un dossier",
	modal: "Modifier les paramètres spécifiques au dossier",
	submit: "Valider",

};
