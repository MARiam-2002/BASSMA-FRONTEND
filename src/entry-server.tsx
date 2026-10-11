import { renderToString } from "react-dom/server";
import App from "./App";
import { LanguageProvider } from "./i18n/LanguageProvider";
export { seo, faqs } from "./seo";
export function render() {
  return renderToString(<LanguageProvider><App /></LanguageProvider>);
}
