document.getElementById('serverForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const address = document.getElementById('serverAddress').value;
    const isBedrock = document.getElementById('bedrockCheckbox').checked;

    // Используем расширенный запрос API
    const apiUrl = `https://api.mcsrvstat.us/${isBedrock ? 'bedrock/' : ''}2/${address}?full=true`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        const serverInfo = document.getElementById('serverInfo');
        if (data.online) {
            let playersList = '';
            if (data.players.list) {
                playersList = data.players.list.map(player => `<li>${player}</li>`).join('');
            }

            let pluginsList = '';
            if (data.plugins) {
                pluginsList = data.plugins.names.map(plugin => `<li>${plugin}</li>`).join('');
            }

            let modsList = '';
            if (data.mods) {
                modsList = data.mods.names.map(mod => `<li>${mod}</li>`).join('');
            }

            serverInfo.innerHTML = `
                <div class="alert alert-success">
                    <h4>Server: ${data.hostname}</h4>
                    <p>Status: Online</p>
                    <p>Players: ${data.players.online}/${data.players.max}</p>
                    <p>Version: ${data.version}</p>
                    <p>Ping: ${data.ping} ms</p>
                    <p>MOTD: <pre>${data.motd.clean.join('\n')}</pre></p>
                    ${playersList ? `<p>Players Online:</p><ul>${playersList}</ul>` : ''}
                    ${pluginsList ? `<p>Plugins:</p><ul>${pluginsList}</ul>` : ''}
                    ${modsList ? `<p>Mods:</p><ul>${modsList}</ul>` : ''}
                    <p>IP: ${data.ip}</p>
                    <p>Port: ${data.port}</p>
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