// Функция для получения статуса сервера
async function fetchServerStatus(address) {
    const apiUrl = `https://api.mcsrvstat.us/2/${address}?full=true`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Ошибка:', error);
        return null;
    }
}

// Функция для получения DNS-информации
async function getDNSInfo(domain) {
    try {
        // Запрос A-записей
        const aResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
        const aData = await aResponse.json();

        // Запрос SRV-записей (для Minecraft)
        const srvResponse = await fetch(`https://dns.google/resolve?name=_minecraft._tcp.${domain}&type=SRV`);
        const srvData = await srvResponse.json();

        let dnsTable = '<h5 class="mt-4">DNS Информация</h5><table class="table table-bordered"><thead><tr><th>Хост</th><th>Тип</th><th>Данные</th></tr></thead><tbody>';

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
        console.error('Ошибка при получении DNS информации:', error);
        return '<p>Не удалось получить DNS информацию.</p>';
    }
}

// Функция для обновления панельки с информацией о сервере play.spinbox.fun
async function updateServerPanel() {
    const serverAddress = 'play.spinbox.fun'; // Адрес сервера
    const serverOnlineElement = document.getElementById('serverOnline');
    const modalOnlineElement = document.getElementById('modalOnline');

    try {
        const data = await fetchServerStatus(serverAddress);
        if (data && data.online) {
            const onlinePlayers = data.players.online;
            serverOnlineElement.textContent = `Онлайн: ${onlinePlayers} игроков`;
            modalOnlineElement.textContent = `Онлайн: ${onlinePlayers} игроков`;
        } else {
            serverOnlineElement.textContent = 'Сервер оффлайн';
            modalOnlineElement.textContent = 'Сервер оффлайн';
        }
    } catch (error) {
        console.error('Ошибка при получении данных о сервере:', error);
        serverOnlineElement.textContent = 'Ошибка загрузки';
        modalOnlineElement.textContent = 'Ошибка загрузки';
    }
}

// Обновляем панельку и модальное окно при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    updateServerPanel();
});

// Обработчик формы для проверки других серверов
document.getElementById('serverForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const address = document.getElementById('serverAddress').value;
    const isBedrock = document.getElementById('bedrockCheckbox').checked;

    // Скрываем панельку play.spinbox.fun
    const serverPanel = document.getElementById('serverPanel');
    serverPanel.classList.add('hidden');

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
                <div class="alert alert-success animate__animated animate__fadeIn">
                    <h4>Сервер: ${data.hostname}</h4>
                    <p>Статус: Онлайн</p>
                    <p>Игроки: ${data.players.online}/${data.players.max}</p>
                    <p>Версия: ${data.version}</p>
                    <p>Пинг: ${data.ping} мс</p>
                    <p>MOTD: <pre>${data.motd.clean.join('\n')}</pre></p>
                    ${playersList ? `<p>Игроки онлайн:</p><ul>${playersList}</ul>` : ''}
                    ${pluginsList ? `<p>Плагины:</p><ul>${pluginsList}</ul>` : ''}
                    ${modsList ? `<p>Моды:</p><ul>${modsList}</ul>` : ''}
                    <p>IP: ${data.ip}</p>
                    <p>Порт: ${data.port}</p>
                    ${dnsInfo}
                </div>
            `;
        } else {
            serverInfo.innerHTML = `
                <div class="alert alert-danger animate__animated animate__fadeIn">
                    <p>Сервер оффлайн или недоступен.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Ошибка:', error);
        serverInfo.innerHTML = `
            <div class="alert alert-danger animate__animated animate__fadeIn">
                <p>Произошла ошибка при проверке статуса сервера.</p>
            </div>
        `;
    }
});