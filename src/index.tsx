import { ActionPanel, Action, Form, useNavigation } from "@raycast/api";
import { useFetch, useCachedState, useForm, FormValidation, useFrecencySorting } from "@raycast/utils";
import type { Language, CheckTextResponse } from "./types";
import CheckTextResult from "./CheckTextResult";

interface FormValues {
    language: string;
    "text-to-check": string;
}

const LANGUAGES_URL = "https://api.languagetoolplus.com/v2/languages";
const CHECK_URL = "https://api.languagetoolplus.com/v2/check";

export default function Command() {
    const { push } = useNavigation();

    // Persistir idioma selecionado entre execuções
    const [selectedLanguage, setSelectedLanguage] = useCachedState<string>("selected-language", "en-US");

    // Buscar idiomas com cache automático
    const { data: languages, isLoading: loadingLanguages } = useFetch<Language[]>(LANGUAGES_URL);

    // Ordenar idiomas por frequência de uso (mais usados aparecem primeiro!)
    const { data: sortedLanguages, visitItem } = useFrecencySorting(languages || [], {
        key: (lang) => lang.longCode,
    });

    // Form com validação
    const { handleSubmit, itemProps, values } = useForm<FormValues>({
        async onSubmit(values) {
            // Registra o uso do idioma para sorting
            const lang = languages?.find((l) => l.longCode === values.language);
            if (lang) visitItem(lang);

            // Faz a verificação
            const formData = new URLSearchParams({
                text: values["text-to-check"],
                language: values.language,
            });

            try {
                const response = await fetch(CHECK_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }

                const result: CheckTextResponse = await response.json();

                // Navega para a tela de resultados
                push(<CheckTextResult result={result} textChecked={values["text-to-check"]} />);
            } catch (error) {
                console.error("Erro ao verificar texto:", error);
                throw error;
            }
        },
        validation: {
            language: FormValidation.Required,
            "text-to-check": (value) => {
                if (!value || value.trim().length === 0) {
                    return "Text is required";
                } else if (value.trim().length < 3) {
                    return "Text must be at least 3 characters";
                }
            },
        },
        initialValues: {
            language: selectedLanguage,
            "text-to-check": "",
        },
    });

    // Atualiza idioma persistido quando mudar
    const handleLanguageChange = (newLanguage: string) => {
        setSelectedLanguage(newLanguage);
        itemProps.language.onChange?.(newLanguage);
    };

    return (
        <Form
            isLoading={loadingLanguages}
            actions={
                <ActionPanel>
                    <Action.SubmitForm title="Check Text" onSubmit={handleSubmit} />
                </ActionPanel>
            }
        >
            <Form.Dropdown
                title="Language"
                placeholder="Select a language"
                {...itemProps.language}
                onChange={handleLanguageChange}
            >
                {sortedLanguages.map((lang) => (
                    <Form.Dropdown.Item key={lang.longCode} value={lang.longCode} title={lang.name} />
                ))}
            </Form.Dropdown>

            <Form.TextArea
                title="Text to check"
                placeholder="Type or paste your text here..."
                enableMarkdown={false}
                {...itemProps["text-to-check"]}
            />

            <Form.Description
                text={`${values["text-to-check"]?.length || 0} characters`}
            />
        </Form>
    );
}
