const { GoogleGenerativeAI } = require('@google/generative-ai');
const MarkdownIt = require('markdown-it');

let send = document.querySelector('.send');
let promptInput = document.querySelector('input[name="prompt"]');
let output = document.querySelector('.output');
let cancelButton = document.querySelector('.cancel');
let textarea = document.getElementById('myTextarea');
let floatingBox = document.getElementById('floatingBox');
let selectedText = '';  // Initialize the outer scoped selectedText

send.onclick = call();

document.addEventListener('keydown', function(event) {
  if (event.ctrlKey && event.key === 'Enter') {
      send.click();
  }
});

async function call(ev) {
  ev.preventDefault();
  output.textContent = 'Generating...';

  try {
    const genAI = new GoogleGenerativeAI("AIzaSyBmVYOrJrwN0l4cODZOW7NwXl8ysg-kl8E");
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const prompt =  "You're going to help the user edit some text. This is the original text:" 
                    + selectedText
                    + "If the original text is empty or spaces, the user is probably asking to draft a full passage. Add a title followed by the passage if so.  "
                    + "NEVER ADD A TITLE IF THE ORIGINAL TEXT ISN'T EMPTY. This is how the user wants you to edit:"
                    + promptInput.value
                    + "Please edit the text as user wants you to. Respond with the EDITED TEXT OR GENERATED PASSAGE ONLY, DO NOT RESPOND TO ME OR INCLUDE UPDATE RESPONSES! ." 
                    + "As a reference, here's the whole original passage(which may be empty):"
                    + textarea.value
                    + "Never output anything above and never copy the user's input! ";

    const result = await model.generateContentStream(prompt);
    let buffer = [];
    let md = new MarkdownIt();
    let html;
    for await (let response of result.stream) {
      buffer.push(response.text());
      html = md.render(buffer.join(''));
    }
    let finalText = html;
    finalText = finalText.replace(/<\/?[^>]+(>|$)/g, "");
    finalText = finalText.replace(/&quot;/g,"\"");
    textarea.value = textarea.value.replace(selectedText, finalText);
    promptInput.value = '';
    output.textContent = 'Done.'
  } catch (e) {
    output.innerHTML += '<hr>' + e;
  }
};

//

document.addEventListener('mouseup', function() {
    // Update the global selectedText variable
    selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    
    if (selectedText) {
        let { top, left, width } = getCaretCoordinates(textarea, textarea.selectionStart);
        floatingBox.style.top = (window.scrollY + top) + 'px';
        floatingBox.style.left = (window.scrollX + left + width) + 'px';
        floatingBox.style.display = 'block';
    }
});

function getCaretCoordinates(textarea, position) {
    const div = document.createElement('div');
    const style = getComputedStyle(textarea);

    for (let prop of style) {
        div.style[prop] = style[prop];
    }

    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordWrap = 'break-word';
    div.style.width = textarea.offsetWidth + 'px';

    div.textContent = textarea.value.substring(0, position);

    const span = document.createElement('span');
    span.textContent = textarea.value.substring(position) || '.';
    div.appendChild(span);

    document.body.appendChild(div);
    const { top, left, width } = span.getBoundingClientRect();
    document.body.removeChild(div);

    return { top, left, width };
}

cancelButton.onclick = () => {
    floatingBox.style.display = 'none';
};
