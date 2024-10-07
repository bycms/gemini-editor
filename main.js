import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "/@google/generative-ai";
import MarkdownIt from 'markdown-it';

let API_KEY = "AIzaSyBmVYOrJrwN0l4cODZOW7NwXl8ysg-kl8E";
let form = document.querySelector('form');
let promptInput = document.querySelector('input[name="prompt"]');
let output = document.querySelector('.output');
let cancelButton = document.querySelector('.cancel');
let textarea = document.getElementById('myTextarea');
let floatingBox = document.getElementById('floatingBox');

form.onsubmit = async (ev) => {
  ev.preventDefault();
  output.textContent = 'Generating...';

  try {
    // Call the model, and get a stream of results
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    // Assemble the prompt

    const prompt = promptInput.value;

    const result = await model.generateContentStream(prompt);
    // Read from the stream and interpret the output as markdown
    let buffer = [];
    let md = new MarkdownIt();
    let html;
    for await (let response of result.stream) {
      buffer.push(response.text());
      html = md.render(buffer.join(''));
      //output.innerHTML = md.render(buffer.join(''));
    }
    let finalText = html;
    finalText = finalText.replace(/<\/?[^>]+(>|$)/g, "");
    finalText = finalText.replace(/&quot;/g,"\"");
    textarea.value += "\n" + finalText;
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