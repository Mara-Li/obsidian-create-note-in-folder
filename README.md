# Commands: Create note in folder

This plugin adds a new command to create a new note in a specific path.  

To add a path, use the settings tab. It will ask you to select a path. The plugin will then create a new note in this path.  

You can choose how per each folder :  
- The note is named with a filename and a possible template.
- The note is created (in the current tab, in a new tab, windows or in a split view)  
- If the note must be focused after creation  

After adding the path, you can use the command "Create new note in folder {path}" to create a new note in this path.  

## About file name & template

You can choose to set a filename and a template. The template can be :
- The folder name
- A date, with the format based on [moment.js](https://momentjs.com/docs/#/displaying/).

In the case you choose to use a template, you don't need to set a filename. Moreover, you can choose how the template will be added :
- Before the filename (if any)
- After it.  
And you can set a separator. 

The title will be incremented if a file with the same name already exists.

If you have the Templater plugin installed and configured, you can assign a template to a note. Once a note is created, the assigned template will be executed. This functionality enables you to replicate the behavior of "Folder Templates." However, because I permit the utilization of folder paths with variables, you gain a higher degree of flexibility.

> [!NOTE]   
> In other words, there is no necessity to individually add a template for each folder and you must prefer employ a [custom variable](#custom-variables) instead.

### Incrementing title

You can choose to increment the title if a file with the same name already exists. If this option is disabled, the plugin will open the existing file instead of creating a new one.

## Custom variables

When creating files or folders, you can use custom variables in the path to customize the names. To use a variable, simply put its name between `{{` and `}}`. For instance, if you have a variable named `myVar`, you can incorporate it into the path like this: `{{myVar}}`.

Remember that if the folder you're referencing doesn't exist yet, it will only be created when you use a variable in the path.

You have several naming options:
1. **Regular Expression (regex):** Enclose the regex in `//`, e.g., `/\d+-\d+/gi`. This will match numbers separated by a dash, like `{{/\d+-\d+/gi}}`. Any folder name matching this regex will be replaced with the contents of that folder. For example, it allows you to create a file in a folder named `2021-01` by using the regex `/\d+-\d+/gi` in the path. This works for `2021-02`, `2021-03`, etc., as well. Without using the regex, you'd need a separate template for each folder.
2. **Strict String:** Use a plain text string as is.
3. **Date Format:** Utilize date formats based on [moment.js](https://momentjs.com/docs/#/displaying/), like `YYYY-MM-DD`, which would be replaced by the current date in the format `2021-01-01`. This enables you to use dynamic dates in your paths, such as the folder of the current month by using `YYYY-MM`. Without this feature, you'd have to create individual templates for each month.

> [!NOTE]
> Using this with the templater settings could you prevent to set-up in templater option a lot of folder.

---
# Installation  

- [x] From Obsidian's community plugins  
- [x] Using [BRAT](https://github.com/TfTHacker/obsidian42-brat#adding-a-beta-plugin) using `https://github.com/Lisandra-dev/create-note-in-folder`  
- [x] From the release page:  
  - Download the latest release  
  - Unzip create-note-in-path.zip in `.obsidian/plugins/` path  
  - In Obsidian settings, reload the plugin  
  - Enable the plugin  

# Translations  

- [x] English  
- [x] French  

To add a translation:  
- Fork the repository
- Add a new file in `plugin/i18n/locales` with the name of the language (ex: `de.ts`)
- Copy the content of [`plugin/i18n/locales/en.ts`](src/i18n/locales/en.json) in the new file
- Translate the content of the file
- Create a pull request

# Credit  
Many thanks to @SilentVoid13 and @RafaelGB for their [Templater](https://github.com/SilentVoid13/Templater) and [dbFolder](https://github.com/RafaelGB/obsidian-db-folder), where some part of the code where taken.  

---

<a href='https://ko-fi.com/X8X54ZYAV' target='_blank'><img height='36' style='border:0px;height:36px;display:block;margin-left:50%;' src='https://cdn.ko-fi.com/cdn/kofi1.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>  
