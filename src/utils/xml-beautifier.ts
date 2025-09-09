import xmlFormatter from 'xml-formatter'

export const prettyPrintUserPrompt = (userPrompt?: string) => {
    if (!userPrompt) return ''
    // xml-formatter is forgiving. If input is not well-formed, we fall back safely.
    try {
        return xmlFormatter(userPrompt, {
            indentation: '\t',
            collapseContent: false,
            lineSeparator: '\r\n',
        })
    } catch {
        // Fallback: return as-is so you still see something
        return userPrompt
    }
}