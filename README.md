# Create new note in path  

This plugin add a new command to create a new note in a specific path.  

To add a path, use the settings tab. It will ask you to select a path. The plugin will then create a new note in this path.  

You can choose how, per each folder :  
- The note is named
- The note is created (in the current tab, in a new tab, windows or in a split view)  
- If the note must be focused after creation  

After adding the path, you can use the command "Create new note in folder {path}" to create a new note in this path.  

### About file name

You can choose three options for the file name:
- A string name (ex: "Untitled")
- The date (based on a format)
- The folder name

For the date, you need to choose the format. You can use the same format as the [date format](https://momentjs.com/docs/#/displaying/format/) of moment.js.

The title will be incremented if a file with the same name already exists.

> **Note**  
> If you have set a template for the path, the new note will be created with the template.  

## Installation  

- [ ] From Obsidian's community plugins  
- [x] Using [BRAT](https://github.com/TfTHacker/obsidian42-brat#adding-a-beta-plugin) using `https://github.com/Lisandra-dev/create-note-in-folder`  
- [x] From release page:  
  - Download the latest release  
  - Unzip create-note-in-path.zip in `.obsidian/plugins/` path  
  - In Obsidian settings, reload the plugin  
  - Enable the plugin  

## Translations  

- [x] English  
- [x] French  

To add a translation:  
- Fork the repository
- Add a new file in `plugin/i18n/locales` with the name of the language (ex: `de.ts`)
- Copy the content of [`plugin/i18n/locales/en.ts`](plugin/i18n/locales/en.ts) in the new file
- Translate the content of the file
- Create a pull request

## Credit  
Many thanks to @SilentVoid13 and @RafaelGB for their [Templater](https://github.com/SilentVoid13/Templater) and [dbFolder](https://github.com/RafaelGB/obsidian-db-folder), where some part of the code where taken.  

---

<a href='https://ko-fi.com/X8X54ZYAV' target='_blank'><img height='36' style='border:0px;height:36px;display:block;margin-left:50%;' src='https://cdn.ko-fi.com/cdn/kofi1.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>  
