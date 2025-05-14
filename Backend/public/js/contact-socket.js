document.addEventListener('DOMContentLoaded', function() {
    const socket = io();
    const messageSection = document.querySelector('.message-section');
    
    if (!messageSection) return;

    const isLoggedIn = messageSection.dataset.isLoggedIn === 'true';
    const isAgent = messageSection.dataset.isAgent === 'true';
    const messagesList = document.getElementById('messagesList');

    // Request existing messages when connecting
    socket.emit('getExistingMessages');

    // Handle existing messages
    socket.on('existingMessages', function(messages) {
        if (!isAgent && messagesList) {
            messages.forEach(message => {
                appendMessage(message);
            });
        }
    });

    // Handle new messages for all users
    socket.on('newAgentMessage', function(message) {
        if (!isAgent && messagesList) {
            appendMessage(message);
            // Scroll to the newest message
            messagesList.scrollTop = 0;
        }
    });

    function appendMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message-item';
        messageDiv.style = 'margin-bottom: 15px; padding: 10px; border-bottom: 1px solid #eee;';
        
        const timestamp = new Date(message.timestamp).toLocaleString();
        
        messageDiv.innerHTML = `
            <strong>${message.agentName}</strong>
            <span style="color: #666; font-size: 0.9em;"> - ${timestamp}</span>
            <p style="margin-top: 5px;">${message.content}</p>
        `;

        messagesList.insertBefore(messageDiv, messagesList.firstChild);
    }

    // Agent message form handling
    if (isLoggedIn && isAgent) {
        const agentMessageForm = document.getElementById('agentMessageForm');
        const messageStatus = document.getElementById('messageStatus');
        
        if (agentMessageForm) {
            agentMessageForm.addEventListener('submit', async function(e) {
                e.preventDefault(); // Prevent form submission

                const messageContent = document.getElementById('messageContent').value.trim();
                
                if (!messageContent) {
                    showStatus('Please enter a message', 'error');
                    return;
                }

                try {
                    const response = await fetch('/agent/messages', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ content: messageContent })
                    });

                    const data = await response.json();

                    if (data.success) {
                        document.getElementById('messageContent').value = '';
                        showStatus('Message sent successfully!', 'success');
                    } else {
                        showStatus(data.message || 'Failed to send message', 'error');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showStatus('Error sending message', 'error');
                }
            });
        }

        function showStatus(message, type) {
            if (messageStatus) {
                messageStatus.textContent = message;
                messageStatus.style.display = 'block';
                messageStatus.className = `alert alert-${type === 'success' ? 'success' : 'danger'}`;
                setTimeout(() => {
                    messageStatus.style.display = 'none';
                }, 3000);
            }
        }
    }
});