document.getElementById('serverForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const address = document.getElementById('serverAddress').value;
    const isBedrock = document.getElementById('bedrockCheckbox').checked;

    // Используем публичный API для проверки статуса сервера
    const apiUrl = `https://api.mcsrvstat.us/${isBedrock ? 'bedrock/' : ''}2/${address}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        const serverInfo = document.getElementById('serverInfo');
        if (data.online) {
            serverInfo.innerHTML = `
                <div class="alert alert-success">
                    <h4>Server: ${data.hostname}</h4>
                    <p>Status: Online</p>
                    <p>Players: ${data.players.online}/${data.players.max}</p>
                    <p>Version: ${data.version}</p>
                    <p>Ping: ${data.ping} ms</p>
                </div>
            `;
        } else {
            serverInfo.innerHTML = `
                <div class="alert alert-danger">
                    <p>Server is offline or unreachable.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error:', error);
        serverInfo.innerHTML = `
            <div class="alert alert-danger">
                <p>An error occurred while fetching server status.</p>
            </div>
        `;
    }
});