import { marked } from 'marked';

const mdOptions = {
    // whether to conform to original MD implementation
    pedantic: false,
    // Github Flavoured Markdown
    gfm: true,
    // tables extension
    tables: true,
    // smarter list behavior
    smartLists: true,
    // "smart" typographic punctuation for things like quotes and dashes
    smartypants: true
};

export async function m(source: string): Promise<string> {
    return marked(source, mdOptions);
}
