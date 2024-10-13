const { GoogleGenerativeAI } = require('@google/generative-ai');
const MarkdownIt = require('markdown-it');

let API_KEY = "AIzaSyBmVYOrJrwN0l4cODZOW7NwXl8ysg-kl8E";
let form = document.querySelector('form');
let promptInput = document.querySelector('input[name="prompt"]');
let output = document.querySelector('.output');
let cancelButton = document.querySelector('.cancel');
let textarea = document.getElementById('myTextarea');
let floatingBox = document.getElementById('floatingBox');
let selectedText;

form.onsubmit = async (ev) => {
  ev.preventDefault();
  output.textContent = 'Generating...';

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chat = model.startChat({
      history: [
      {
        role: "model",
        parts: [{ text: "Sure! Let's start." }]
      },
      ],
    });
    // Assemble the prompt

    let prompt =  "You're going to help the user edit some text. This is the original text:" 
                    + selectedText
                    + "If the original text is empty or spaces, the user is probably asking to draft a full passage. Add a title followed by the passage if so.  "
                    + "NEVER ADD A TITLE IF THE ORIGINAL TEXT ISN'T EMPTY. This is how the user wants you to edit:"
                    + promptInput.value
                    + "Please edit the text as user wants you to. Respond with the EDITED TEXT OR GENERATED PASSAGE ONLY, DO NOT RESPOND TO ME OR INCLUDE UPDATE RESPONSES! ." 
                    + "As a reference, here's update update update passage(which may be empty):"
                    + textarea.value
                    + "Never output anything I told you to the user and never copy the user's input! ";

    let result = await chat.sendMessage(prompt);
    // Read and interpret the output as markdown
    let md = new MarkdownIt();
    let html = md.render(result.response.text());
    let finalText = html;
    finalText = finalText.replace(/<\/?[^>]+(>|$)/g, "");
    finalText = finalText.replace(/&quot;/g,"\"");
    textarea.value = textarea.value.replace(selectedText, finalText);
    promptInput.value = '';
    output.innerHTML = "Done";
  } catch (e) {
    output.innerHTML += '<hr>' + e;
  }
};

//
        document.addEventListener('mouseup', function() {
            let selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
            
            if (selectedText) {
                // Calculate the position of the selected text in the textarea
                let { top, left, width } = getCaretCoordinates(textarea, textarea.selectionStart);
                
                // Position the box just to the right of the selected text
                floatingBox.style.top = (window.scrollY + top) + 'px';
                floatingBox.style.left = (window.scrollX + left + width) + 'px';
                
                // Show the floating box
                floatingBox.style.display = 'block';
            }
        });

        // Helper function to get caret position in a <textarea>
        function getCaretCoordinates(textarea, position) {
            const div = document.createElement('div');
            const style = getComputedStyle(textarea);
            
            // Copy textarea styles to the dummy div
            for (let prop of style) {
                div.style[prop] = style[prop];
            }
            
            // Set specific properties to mimic the textarea behavior
            div.style.position = 'absolute';
            div.style.visibility = 'hidden';
            div.style.whiteSpace = 'pre-wrap';
            div.style.wordWrap = 'break-word';
            div.style.width = textarea.offsetWidth + 'px';
            
            // Mirror the text content up to the caret position
            div.textContent = textarea.value.substring(0, position);
            
            // Create a span to hold the caret position
            const span = document.createElement('span');
            span.textContent = textarea.value.substring(position) || '.';
            div.appendChild(span);
            
            document.body.appendChild(div);
            const { top, left, width } = span.getBoundingClientRect();
            document.body.removeChild(div);
            
            return { top, left, width }; // Return the width for positioning the box
        }

        cancelButton.onclick =()=> {
          floatingBox.style.display = 'none';
        }
