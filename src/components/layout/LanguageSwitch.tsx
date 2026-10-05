import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { LANGUAGES, rememberLanguage, type Language } from "@/lib/i18n";

/** Uzbek is primary, English optional (D20). */
const LanguageSwitch = () => {
  const { i18n, t } = useTranslation();
  const current = (i18n.resolvedLanguage ?? "uz") as Language;
  const next = LANGUAGES[(LANGUAGES.indexOf(current) + 1) % LANGUAGES.length];

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1.5 px-2 text-muted-foreground"
      onClick={() => {
        void i18n.changeLanguage(next);
        rememberLanguage(next);
      }}
      title={t("common.language")}
      aria-label={t("common.language")}
      data-testid="language-switch"
    >
      <Languages className="h-4 w-4" aria-hidden />
      <span className="text-xs font-semibold uppercase">{current}</span>
    </Button>
  );
};

export default LanguageSwitch;
