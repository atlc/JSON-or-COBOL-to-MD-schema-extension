function convertToMarkdownTable(JSONbody) {
    if (JSONbody.Request) {
        var records = JSONbody.Request[Object.keys(JSONbody.Request)[0]].records[0];
    } else if (JSONbody.Response) {
        var records = JSONbody.Response[Object.keys(JSONbody.Response)[0]].records[0];
    } else {
        alert('You have selected an invalid JSON body');
        return;
    }

    let markdownStr = `**Parameters**\n\n| Field | Required | Description/Type |\n| --- | --- | --- |\n`;
    for (i=0; i < Object.keys(records).length; i++) {
        markdownStr += `| ${Object.keys(records)[i]} | **?¿?¿?** | ${typeof Object.values(records)[i]} |\n`;
    }

    if (confirm(`Copy to clipboard?\n\n${markdownStr}`)) {
        copyToClipboard(markdownStr);
    }
}

function copyToClipboard(text) {
    let tempElement = document.createElement("textarea");
    document.body.appendChild(tempElement);
    tempElement.value = text;
    tempElement.select();
    document.execCommand("copy");
    tempElement.parentNode.removeChild(tempElement);
}

chrome.commands.onCommand.addListener(function(command) {
    if (command === "call-conversion-function") {
        let jsonFromClipboard = prompt("Paste your JSON body to translate the schema into Markdown");
        convertToMarkdownTable(JSON.parse(jsonFromClipboard));
    }
});

chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        id: "convert-menu",
        title: "Convert highlighted JSON schema to Markdown?",
        contexts:["selection"]
    });
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId == "convert-menu") {
        convertToMarkdownTable(JSON.parse(info.selectionText));
    }
});
