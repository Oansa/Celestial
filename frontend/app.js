let isVoiceMode = false;

document.getElementById('text-mode').onclick = function() {
    isVoiceMode = false;
    this.classList.add('active');
    document.getElementById('voice-mode').classList.remove('active');
    document.getElementById('text-input-container').style.display = 'block';
};

document.getElementById('voice-mode').onclick = function() {
    isVoiceMode = true;
    this.classList.add('active');
    document.getElementById('text-mode').classList.remove('active');
    document.getElementById('text-input-container').style.display = 'none';
};

document.getElementById('take-photo').onclick = async function() {
    const formData = new FormData();
    formData.append('mode', 'live');
    formData.append('use_voice', isVoiceMode.toString());
    if (!isVoiceMode) {
        const userText = document.getElementById('user-question').value;
        if (!userText) {
            alert('Please enter a question');
            return;
        }
        formData.append('user_text', userText);
    }
    
    showOutput('[INFO] Taking live photo...');
    try {
        const res = await fetch('http://localhost:5000/analyze', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        showOutput(data.output);
    } catch (error) {
        showOutput('Error: ' + error.message);
    }
};

document.getElementById('upload-image').onchange = async function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!isVoiceMode) {
        const userText = document.getElementById('user-question').value;
        if (!userText) {
            alert('Please enter a question');
            return;
        }
        
        const formData = new FormData();
        formData.append('mode', 'upload');
        formData.append('image', file);
        formData.append('user_text', userText);
        formData.append('use_voice', 'false');
        
        showOutput('[INFO] Uploading image...');
        try {
            const res = await fetch('http://localhost:5000/analyze', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            showOutput(data.output);
        } catch (error) {
            showOutput('Error: ' + error.message);
        }
    } else {
        // Handle voice input mode
        const formData = new FormData();
        formData.append('mode', 'upload');
        formData.append('image', file);
        formData.append('use_voice', 'true');
        
        showOutput('[INFO] Uploading image and waiting for voice input...');
        try {
            const res = await fetch('http://localhost:5000/analyze', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            showOutput(data.output);
        } catch (error) {
            showOutput('Error: ' + error.message);
        }
    }
};

function showOutput(text) {
    document.getElementById('terminal-output').textContent = text;
}