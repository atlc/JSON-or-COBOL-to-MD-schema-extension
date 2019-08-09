function jsonToMarkdownSchema(JSONbody) {
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

function objectToMarkdownSchema(obj) {
    try {
        obj = JSON.parse(obj);
        let markdownStr = `**Parameters**\n\n| Field | Required | Description/Type |\n| --- | --- | --- |\n`;
        for (i=0; i < Object.keys(obj).length; i++) {
            markdownStr += `| ${Object.keys(obj)[i]} | **?¿?¿?** | ${typeof Object.values(obj)[i]} |\n`;
        }
        if (confirm(`Copy to clipboard?\n\n${markdownStr}`)) {
            copyToClipboard(markdownStr);
        }
    }    
    catch {
        alert('You have selected an invalid object');
        return;
    }
}

function cobolToMarkdownSchema(cobolBody) {
    let cobolString = cobolBody.toString();
    if (cobolString.match(/\w+-in\sidentified\sby/)) {
        let markdownStr = `**Parameters**\n\n| Field | Required | Description/Type |\n| --- | --- | --- |\n`;
        let inputVariables = cobolString.match(/\w+-in\s+pic\s(x|\d)/g);
        inputVariables.forEach(line => {
            let parsed = line.split(/-in\s+pic\s/g);
            let dataType = (parsed[1] == "9") ? "number" : (parsed[1] == "x") ? "string" : `**Cannot infer from "PIC ${parsed[1]}"**`;
            markdownStr += `| ${parsed[0]} | **?¿?¿?** | ${dataType} |\n`;
        });
        if (confirm(`Copy to clipboard?\n\n${markdownStr}`)) {
            copyToClipboard(markdownStr);
        }
    } else {
        alert('You have selected an invalid COBOL body');
    }
}

function linkageToMarkdownSchema(linkageBody) {
    let linkageStr = linkageBody.toString();
    if (linkageStr.match(/indexed\sby\s\w+-\w+.*/)) {
        let markdownStr = `**Parameters**\n\n| Field | Required | Description/Type |\n| --- | --- | --- |\n`;
        let linkageCodes = linkageStr.match(/indexed\sby\s\w+-\w+.*/)[0].replace(/10\slk/g, '').replace(/\s/g, '').split('\.');
        linkageCodes = linkageCodes.filter(code => code.match(/^\$elkname\.*/));
        linkageCodes.forEach(code => {
            let fieldName = code.match(/=\w+/)[0].replace('=','');
            let codeType = code.match(/pic\w/)[0].replace('pic','');
            let dataType = (codeType == "9") ? "number" : (codeType == "x") ? "string" : `**Cannot infer from "PIC ${codeType}"**`;
            markdownStr += `| ${fieldName} | **?¿?¿?** | ${dataType} |\n`;
        });
        if (confirm(`Copy to clipboard?\n\n${markdownStr}`)) {
            copyToClipboard(markdownStr);
        }
    } else {
        alert('You have selected an invalid linkage body');
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
        jsonToMarkdownSchema(JSON.parse(jsonFromClipboard));
    }
});

chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        id: "convert-parent-menu",
        title: "Convert to schema in Markdown?",
        contexts:["selection"]
    });

    let submenus = [
        { "id": "convert-JSON",         "text": "{ \"Request\":  { \"endpointName\": { \"records\": [ { \"keyId\": 6789998212 } } } }" },
        { "id": "convert-bare-object",  "text": "{ \"keyId\": 6789998212,   \"field2\": \"value2\" }" },
        { "id": "convert-COBOL",        "text": "RESTendpoint.CBL" },
        { "id": "convert-LK",           "text": "LINKAGE.LK" }
    ]
    
    for (let i=0; i < submenus.length; i++) {
        chrome.contextMenus.create({
            id: submenus[i].id,
            parentId: "convert-parent-menu",
            title: submenus[i].text,
            contexts:["selection"]
        });
    }
});

chrome.contextMenus.onClicked.addListener(info => {
    switch (info.menuItemId) {
        case "convert-JSON": jsonToMarkdownSchema(JSON.parse(info.selectionText));
            break;
        case "convert-bare-object": objectToMarkdownSchema(JSON.stringify(info.selectionText));
            break;
        case "convert-COBOL": cobolToMarkdownSchema(info.selectionText);
            break;
        case "convert-LK": linkageToMarkdownSchema(info.selectionText);
            break;
        default: break;
    }
});
