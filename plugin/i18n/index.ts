/* Forked from https://github.com/valentine195/obsidian-admonition/blob/master/src/lang/helpers.ts
*
* MIT License
*
* Copyright (c) 2021 Jeremy Valentine
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/

import { moment } from "obsidian";
import en from "./locales/en";
import fr from "./locales/fr";

const localeMap: { [k: string]: Partial<typeof en> } = {
	en: en,
	fr: fr,
};

const locale = localeMap[moment.locale()];
export const translationLanguage = locale ? moment.locale() : "en";

function nestedProp(obj: object, path: string): unknown {
	return path.split(".").reduce((o, k) => o ? (o as never)[k] : undefined, obj);
}

export function t(multipleKey:string): string  {
	// @ts-ignore
	return (locale && nestedProp(locale, multipleKey))|| nestedProp(en, multipleKey);
}
