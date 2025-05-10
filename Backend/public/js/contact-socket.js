document.addEventListener('DOMContentLoaded', function() {
    const socket = io();
    const messageSection = document.querySelector('.message-section');
    
    if (!messageSection) return;

    const isLoggedIn = messageSection.dataset.isLoggedIn === 'true';
    const isAgent = messageSection.dataset.isAgent === 'true';
    const userName = messageSection.dataset.userName;

    if (isLoggedIn && isAgent) {
        const agentMessageForm = document.getElementById('agentMessageForm');
        if (!agentMessageForm) return;

        agentMessageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const messageContent = document.getElementById('messageContent').value;
            
            if (!messageContent.trim()) {
                alert('Please enter a message');
                return;
            }

            // Emit the message
            socket.emit('agentMessage', {
                content: messageContent,
                agentName: userName
            });

            // Clear the input and show confirmation
            document.getElementById('messageContent').value = '';
            alert('Message sent successfully!');
        });
    } else if (isLoggedIn) {
        const messagesList = document.getElementById('messagesList');
        if (!messagesList) return;

        // Listen for new messages
        socket.on('newAgentMessage', function(data) {
            console.log('Received message:', data);
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message-item';
            messageDiv.style.cssText = 'border-bottom: 1px solid #eee; padding: 10px 0; margin-bottom: 10px;';
            
            messageDiv.innerHTML = `
                <p style="margin: 0;"><strong>From Agent:</strong> ${data.agentName}</p>
                <p style="margin: 5px 0;">${data.content}</p>
                <small style="color: #666;">${new Date(data.timestamp).toLocaleString()}</small>
            `;
            
            messagesList.insertBefore(messageDiv, messagesList.firstChild);
        });
    }

    // Debug connection status
    socket.on('connect', () => {
        console.log('Connected to Socket.IO server');
    });

    socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
    });
});