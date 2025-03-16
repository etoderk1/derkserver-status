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

            // DNS-информация (пример для play.spinbox.fun)
            const dnsInfo = `
                <h5 class="mt-4">DNS Information</h5>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Hostname</th>
                            <th>Type</th>
                            <th>Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>_minecraft._tcp.play.spinbox.fun</td>
                            <td>SRV</td>
                            <td>0 5 25565 derk.spinbox.fun</td>
                        </tr>
                        <tr>
                            <td>derk.spinbox.fun</td>
                            <td>A</td>
                            <td>46.174.53.221</td>
                        </tr>
                    </tbody>
                </table>
            `;

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
                    ${dnsInfo}
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