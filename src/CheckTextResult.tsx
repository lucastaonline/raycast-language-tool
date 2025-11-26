import { ActionPanel, Detail, Action, Clipboard, showToast, Toast, Color, Icon } from "@raycast/api";
import { useState, useMemo } from "react";
import type { CheckTextResponse, Match } from "./types";

interface CheckTextResultProps {
    result: CheckTextResponse;
    textChecked: string;
}

export default function CheckTextResult({ result, textChecked }: CheckTextResultProps) {
    const [appliedSuggestions, setAppliedSuggestions] = useState<Set<number>>(new Set());

    // Função helper para calcular texto corrigido
    const calculateCorrectedText = (appliedIndexes: Set<number>) => {
        if (!result.matches || appliedIndexes.size === 0) {
            return textChecked;
        }

        let text = textChecked;
        let offset = 0;

        // Aplica as correções em ordem
        const sortedMatches = result.matches
            .filter((_, index) => appliedIndexes.has(index))
            .sort((a, b) => a.offset - b.offset);

        for (const match of sortedMatches) {
            const replacement = match.replacements[0]?.value || "";
            const start = match.offset + offset;
            const end = start + match.length;

            text = text.slice(0, start) + replacement + text.slice(end);
            offset += replacement.length - match.length;
        }

        return text;
    };

    // Calcula o texto corrigido baseado nas sugestões aplicadas
    const correctedText = useMemo(() => {
        return calculateCorrectedText(appliedSuggestions);
    }, [textChecked, result.matches, appliedSuggestions]);

    // Aplica uma sugestão individual
    const applySuggestion = async (index: number) => {
        const newApplied = new Set(appliedSuggestions);
        newApplied.add(index);
        setAppliedSuggestions(newApplied);

        await showToast({
            style: Toast.Style.Success,
            title: "Suggestion applied",
        });
    };

    // Aplica todas as sugestões
    const applyAllSuggestions = async () => {
        if (!result.matches) return;

        const allIndexes = new Set(result.matches.map((_, index) => index));
        setAppliedSuggestions(allIndexes);

        await showToast({
            style: Toast.Style.Success,
            title: `Applied ${result.matches.length} suggestions`,
        });
    };

    // Copia o texto corrigido
    const copyToClipboard = async () => {
        await Clipboard.copy(correctedText);
        await showToast({
            style: Toast.Style.Success,
            title: "Copied to clipboard",
        });
    };

    // Cola o texto corrigido
    const pasteText = async () => {
        await Clipboard.paste(correctedText);
        await showToast({
            style: Toast.Style.Success,
            title: "Pasted",
        });
    };

    // Reseta as correções
    const resetCorrections = () => {
        setAppliedSuggestions(new Set());
        showToast({
            style: Toast.Style.Success,
            title: "Reset",
        });
    };

    // Markdown do texto corrigido
    const markdown = `# Corrected Text\n\n${correctedText}`;

    const matchesCount = result.matches?.length || 0;
    const appliedCount = appliedSuggestions.size;

    return (
        <Detail
            markdown={markdown}
            navigationTitle="Check Results"
            metadata={
                <Detail.Metadata>
                    <Detail.Metadata.Label title="Total Issues" text={`${matchesCount}`} />
                    <Detail.Metadata.Label title="Applied" text={`${appliedCount}/${matchesCount}`} />

                    {result.language && (
                        <>
                            <Detail.Metadata.Separator />
                            <Detail.Metadata.Label
                                title="Language"
                                text={result.language.name}
                                icon={Icon.Globe}
                            />
                        </>
                    )}

                    {result.matches && result.matches.length > 0 && (
                        <>
                            <Detail.Metadata.Separator />
                            <Detail.Metadata.Label title="Issues" text={`${result.matches.length} issues found`} />

                            {result.matches.map((match, index) => {
                                const isApplied = appliedSuggestions.has(index);
                                const replacement = match.replacements[0]?.value || "";
                                const original = match.context.text.slice(
                                    match.context.offset,
                                    match.context.offset + match.context.length
                                );

                                return (
                                    <Detail.Metadata.Label
                                        key={index}
                                        title={isApplied ? "✅ " + match.shortMessage || match.message : match.shortMessage || match.message}
                                        text={`"${original}" → "${replacement}"`}
                                    />
                                );
                            })}
                        </>
                    )}

                    {matchesCount === 0 && (
                        <>
                            <Detail.Metadata.Separator />
                            <Detail.Metadata.Label
                                title="Great!"
                                text="No issues found"
                                icon={{ source: Icon.CheckCircle, tintColor: Color.Green }}
                            />
                        </>
                    )}
                </Detail.Metadata>
            }
            actions={
                <ActionPanel>
                    {matchesCount > 0 ? (
                        <ActionPanel.Section title="Quick Actions">
                            <Action
                                title="Apply All & Paste"
                                icon={Icon.Wand}
                                onAction={async () => {
                                    // Calcula o texto com TODAS as correções aplicadas
                                    const allIndexes = new Set(result.matches?.map((_, index) => index) || []);
                                    const fullyCorrectedText = calculateCorrectedText(allIndexes);

                                    // Aplica no state
                                    setAppliedSuggestions(allIndexes);

                                    // Cola o texto corrigido
                                    await Clipboard.paste(fullyCorrectedText);

                                    await showToast({
                                        style: Toast.Style.Success,
                                        title: `Applied ${allIndexes.size} suggestions and pasted`,
                                    });
                                }}
                                shortcut={{ modifiers: ["cmd"], key: "return" }}
                            />
                        </ActionPanel.Section>
                    ) : (
                        <ActionPanel.Section title="Quick Actions">
                            <Action
                                title="Paste Text"
                                icon={Icon.Text}
                                onAction={pasteText}
                                shortcut={{ modifiers: ["cmd"], key: "return" }}
                            />
                        </ActionPanel.Section>
                    )}

                    <ActionPanel.Section title="Text Actions">
                        <Action title="Copy Corrected Text" icon={Icon.Clipboard} onAction={copyToClipboard} />
                        {matchesCount > 0 && (
                            <Action title="Paste Corrected Text" icon={Icon.Text} onAction={pasteText} />
                        )}
                    </ActionPanel.Section>

                    {matchesCount > 0 && (
                        <ActionPanel.Section title="Corrections">
                            <Action
                                title="Apply All Suggestions"
                                icon={Icon.CheckCircle}
                                onAction={applyAllSuggestions}
                                shortcut={{ modifiers: ["cmd", "shift"], key: "a" }}
                            />
                            {appliedCount > 0 && (
                                <Action
                                    title="Reset Corrections"
                                    icon={Icon.Undo}
                                    onAction={resetCorrections}
                                    shortcut={{ modifiers: ["cmd"], key: "r" }}
                                />
                            )}
                        </ActionPanel.Section>
                    )}

                    {result.matches && result.matches.map((match, index) => {
                        if (appliedSuggestions.has(index)) return null;

                        return (
                            <ActionPanel.Section key={index} title={`Fix: ${match.shortMessage || match.message}`}>
                                <Action
                                    title={`Apply: "${match.replacements[0]?.value}"`}
                                    icon={Icon.Check}
                                    onAction={() => applySuggestion(index)}
                                />
                            </ActionPanel.Section>
                        );
                    })}
                </ActionPanel>
            }
        />
    );
}
