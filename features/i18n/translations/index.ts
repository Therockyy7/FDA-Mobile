import type { Locale, TranslationDict } from "../types";
import { en } from "./en";
import { vi } from "./vi";

export const translations: Record<Locale, TranslationDict> = { vi, en };

export { en, vi };
