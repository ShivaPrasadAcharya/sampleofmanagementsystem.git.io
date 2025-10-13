// passkey.js
// This script restricts access to the webpage unless the correct passkey is entered.
// Usage: Include this script in index.html before any other scripts that should be protected.


(function() {
    // Set your passkey here
    const PASSKEY = 'null'; // Change this to your desired passkey (set to null to disable protection)

    // If passkey is null or 'null', open site directly
    if (PASSKEY === null || PASSKEY === 'null') {
        return;
    }

    // Check if already authenticated in this session
    if (sessionStorage.getItem('authenticated') === 'true') {
        return;
    }

    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.85)';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '99999';

    // Create input box
    const input = document.createElement('input');
    input.type = 'password';
    input.placeholder = 'Enter passkey...';
    input.style.fontSize = '1.2em';
    input.style.padding = '0.5em';
    input.style.marginBottom = '1em';
    input.style.borderRadius = '5px';
    input.style.border = '1px solid #ccc';

    // Create button
    const button = document.createElement('button');
    button.textContent = 'Unlock';
    button.style.fontSize = '1.1em';
    button.style.padding = '0.5em 1.5em';
    button.style.borderRadius = '5px';
    button.style.border = 'none';
    button.style.background = '#007bff';
    button.style.color = '#fff';
    button.style.cursor = 'pointer';

    // Create error message
    const error = document.createElement('div');
    error.style.color = 'red';
    error.style.marginTop = '1em';
    error.style.fontSize = '1em';
    error.style.display = 'none';

    // Unlock function
    function tryUnlock() {
        if (input.value === PASSKEY) {
            sessionStorage.setItem('authenticated', 'true');
            overlay.remove();
        } else {
            error.textContent = 'Incorrect passkey. Try again.';
            error.style.display = 'block';
            input.value = '';
            input.focus();
        }
    }

    // Enter key support
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            tryUnlock();
        }
    });
    button.addEventListener('click', tryUnlock);

    overlay.appendChild(input);
    overlay.appendChild(button);
    overlay.appendChild(error);
    document.body.appendChild(overlay);
    input.focus();
})();
