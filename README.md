# Commands: Create note in folder

This plugin adds a new command to create a new note in a specific path.

To add a path, use the settings tab. It will ask you to select a path. The plugin will then create a new note in this path.

The main menu allows you :
- To duplicate a command ;
- To move the order for the quick-switcher command (only accessible using the `enable for all folder` options).

> [!NOTE]
> If you want to create a path for the current folder, you can use the `{{current}}` variable in the path.
> The command will only work if you have a file opened in the current tab. You could also use the file-menu to use this command (this need to be enabled in the settings).

You can choose how per each folder :
- The note is named with a filename and a possible template.
- The note is created (in the current tab, in a new tab, windows or in a split view)
- If the note must be focused after creation
- If a template must be applied (using templater)
- If you want a command in the file-menu

After adding the path, you can use the command "Create Note In Folder: {{commandName}}" to use the command.

## Global settings

### Global template

You can set / manage the default template for all folders in the settings tab.

The default template can be used in two ways :
- A default template for all "non registered" folder (i.e. folder not in the settings tab)
- A default template automatically applied when creating a new command, in case you use always the same settings for example.

To use the default template for all folder, you need to click on the enable button.

#### Quick Switcher

You can choose to enable the default template for all folder. In this case, the default template will be used for all folder not in the settings tab.
It will allow you to enable:
- A pseudo quick-switcher with using the command `Create Note In Folder : Quick Switcher`.
- Filter this quick-switcher that remove the registered folder.

### Custom variables

When creating files or folders, you can use custom variables in the path to customize the names. To use a variable, simply put its name between `{{` and `}}`. For instance, if you have a variable named `myVar`, you can incorporate it into the path like this: `{{myVar}}`.

Remember that if the folder you're referencing doesn't exist yet, it will only be created when you use a variable in the path.

You have several naming options:
1. **Regular Expression (regex):** Enclose the regex in `//`, e.g., `/\d+-\d+/gi`. This will match numbers separated by a dash, like `{{/\d+-\d+/gi}}`. Any folder name matching this regex will be replaced with the contents of that folder. For example, it allows you to create a file in a folder named `2021-01` by using the regex `/\d+-\d+/gi` in the path. This works for `2021-02`, `2021-03`, etc., as well. Without using the regex, you'd need a separate template for each folder.
2. **Strict String:** Use a plain text string as is.
3. **Date Format:** Utilize date formats based on [moment.js](https://momentjs.com/docs/#/displaying/), like `YYYY-MM-DD`, which would be replaced by the current date in the format `2021-01-01`. This enables you to use dynamic dates in your paths, such as the folder of the current month by using `YYYY-MM`. Without this feature, you'd have to create individual templates for each month.

> [!NOTE]
> Using this with the templater settings could you prevent to set-up in templater option a lot of folder.


### Focusing

You can choose to totally not open a file that is created. In this case, the file will be created in the background. If you use a template, the templater API will be used, and you don't need to do anything.

With this settings, and if the incrementation is disabled, you can also choose to open the existing file instead of creating a new one.

> [!NOTE]
> Enable the incrementation if you don't want to open the already existing file.

## Per folder settings

### About file name & template

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

#### Incrementing title

You can choose to increment the title if a file with the same name already exists. If this option is disabled, the plugin will open the existing file instead of creating a new one.

## Advanced settings

The plugin allow you to focusing onto the inline title, mimicing the behavior of the Obsidian when creating a new file.
However, with the `{{current}}` template, the methods used is a little "hacky", and could not work in some case. I used a timeout, by default, of 50ms to wait the creation of the file. If you have a slow computer, you can increase this value in the `data.json` file (in the `.obsidian/plugins/create-note-in-folder` folder). For that, you need to search the `timeOutForInlineTitle` variable in the file.

> [!NOTE]
> If the variable is not present, you need to create it at the end of the file.

There is two way to edit/adjust this value:
```json
{
  // (your settings are before)
  timeOutForInlineTitle: 50
}
```
This way will set the value for desktop and mobile to the same amount of time.

```json
{
  // (your settings are before)
  timeOutForInlineTitle: {
    desktop: 50,
    mobile: 100
  }
}
```
Will set the value for desktop and mobile to different amount of time.

After changing the setting, you need to reload the plugin.

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
