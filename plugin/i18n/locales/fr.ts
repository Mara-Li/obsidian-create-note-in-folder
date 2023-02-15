export default {
	title: "Dossiers",
	error: "Ce dossier est déjà dans la liste ou n'existe pas.",
	folderNotFound: "Dossier introuvable",
	header: {
		template: "Modèle",
		opening: "Ouverture",
	},
	template: {
		title: "Choisissez un modèle si vous voulez ajouter quelque chose avant ou après le nom du fichier.",
		desc: "Le nom du fichier peut être vide si vous utilisez un modèle.",
		dropDown: {
			date: {
				title: "Date",
				desc: "Les formats valides peuvent être trouvés ",
				here: "ici",
				url: "https://momentjs.com/docs/#/displaying/format/",
				error: "Format de date invalide, veuillez utiliser un format valide."
			},
			none: "Aucun",
			folderName: "Nom du dossier",
		},
		position: {
			title: "Choisissez où ajouter le modèle.",
			prepend: "Ajouter avant",
			append: "Ajouter après",
		},
		separator: "Séparateur",
	},
	fileName: {
		title: "Choisissez la façon dont les notes seront nommées.",
		desc: "Le nom sera incrémenté si le nom existe déjà.",
		error: "Nom de fichier invalide, veuillez utiliser un nom de fichier si vous n'utilisez pas de modèle.",
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
