document.getElementById('serverForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const address = document.getElementById('serverAddress').value;
    const isBedrock = document.getElementById('bedrockCheckbox').checked;

    // Используем расширенный запрос API для статуса сервера
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

            // Получаем DNS-информацию
            const dnsInfo = await getDNSInfo(address);

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

// Функция для получения DNS-информации
async function getDNSInfo(domain) {
    try {
        // Запрос A-записей
        const aResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
        const aData = await aResponse.json();

        // Запрос SRV-записей (для Minecraft)
        const srvResponse = await fetch(`https://dns.google/resolve?name=_minecraft._tcp.${domain}&type=SRV`);
        const srvData = await srvResponse.json();

        let dnsTable = '<h5 class="mt-4">DNS Information</h5><table class="table table-bordered"><thead><tr><th>Hostname</th><th>Type</th><th>Data</th></tr></thead><tbody>';

        // Добавляем A-записи
        if (aData.Answer) {
            aData.Answer.forEach(record => {
                dnsTable += `<tr><td>${record.name}</td><td>A</td><td>${record.data}</td></tr>`;
            });
        }

        // Добавляем SRV-записи
        if (srvData.Answer) {
            srvData.Answer.forEach(record => {
                const [priority, weight, port, target] = record.data.split(' ');
                dnsTable += `<tr><td>${record.name}</td><td>SRV</td><td>${priority} ${weight} ${port} ${target}</td></tr>`;
            });
        }

        dnsTable += '</tbody></table>';
        return dnsTable;
    } catch (error) {
        console.error('Error fetching DNS info:', error);
        return '<p>Unable to fetch DNS information.</p>';
    }
}