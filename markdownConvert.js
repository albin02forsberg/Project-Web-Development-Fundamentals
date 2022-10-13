exports.convertToHtml = function(markdown) {
    const html = markdown
        .replace(/^##### (.*)/gm, "<h5>$1</h5>")
        .replace(/^#### (.*)/gm, "<h4>$1</h4>")
        .replace(/^### (.*)$/gm, "<h3>$1</h3>")
        .replace(/^## (.*)$/gm, "<h2>$1</h2>")
        .replace(/^# (.*)$/gm, "<h1>$1</h1>")
        .replace(/\*\*(.*)\*\*/gm, "<strong>$1</strong>")
        .replace(/\*(.*)\*/gm, "<em>$1</em>")
        .replace(/!\[(.*)\]\((.*)\)/gm, "<img src='$2' alt='$1' />")
        .replace(/\[(.*)\]\((.*)\)/gm, "<a href='$2'>$1</a>")
        .replace(/^- (.*)/gm, "<li>$1</li>")
        .replace(/^(.*)$/gm, "<p>$1</p>");

    return html;
};