document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 元素引用 ---
    // 获取所有需要操作的HTML元素的引用，方便后续使用。
    const setupScreen = document.getElementById('setup-screen'); // 游戏设置界面
    const gameScreen = document.getElementById('game-screen');   // 游戏主界面
    const startBtn = document.getElementById('start-game-btn');  // 开始游戏按钮
    const playerCountSelect = document.getElementById('player-count'); // 玩家数量选择下拉框
    const playersArea = document.getElementById('players-area'); // 显示所有玩家信息的区域
    const deckElement = document.getElementById('deck');         // 牌堆的HTML元素
    const deckCountElement = document.getElementById('deck-count'); // 显示牌堆剩余数量的元素
    const drawnCardArea = document.getElementById('drawn-card-area'); // 抽到的牌的显示区域
    const drawnCardDisplay = document.getElementById('drawn-card-display'); // 用于显示抽到的牌
    const drawnCardActions = document.getElementById('drawn-card-actions'); // 抽到牌后的操作按钮区域
    const gameLog = document.getElementById('game-log');         // 游戏日志显示区域

    // --- 游戏核心状态变量 ---
    let players = []; // 存储所有玩家对象的数组 {id, name, hand}
    let deck = [];    // 当前的牌堆，存储卡牌ID字符串
    let discardPile = []; // 弃牌堆
    let currentPlayerIndex = 0; // 当前回合玩家在players数组中的索引
    let drawnCard = null; // 当前回合抽到的牌的ID
    let isAwaitingPlayerAction = false; // 状态锁，防止在当前玩家未完成操作时，重复抽牌

    // --- 卡牌基础数据 ---
    // 定义52张牌的ID和对应的个性描述词
    const cardData = [
        { id: 'hA', trait: '善于活跃气氛的' }, { id: 'h2', trait: '过于敏感的' },
        { id: 'h3', trait: '过于忍让的' }, { id: 'h4', trait: '爱热闹的' },
        { id: 'h5', trait: '体贴周到的' }, { id: 'h6', trait: '忠诚的' },
        { id: 'h7', trait: '富于同情心的' }, { id: 'h8', trait: '善解人意的' },
        { id: 'h9', trait: '热心肠的' }, { id: 'h10', trait: '人缘好的' },
        { id: 'hJ', trait: '合群的' }, { id: 'hQ', trait: '喜欢交朋友的' },
        { id: 'hK', trait: '处事圆润的' }, { id: 'cA', trait: '喜欢冒险的' },
        { id: 'c2', trait: '注意力分散的' }, { id: 'c3', trait: '不受约束的' },
        { id: 'c4', trait: '冲动的' }, { id: 'c5', trait: '好奇心强的' },
        { id: 'c6', trait: '别出心裁的' }, { id: 'c7', trait: '思想开放的' },
        { id: 'c8', trait: '爱幻想的' }, { id: 'c9', trait: '有创造力的' },
        { id: 'c10', trait: '爱好广泛的' }, { id: 'cJ', trait: '灵活的' },
        { id: 'cQ', trait: '敢说敢做的' }, { id: 'cK', trait: '心血来潮的' },
        { id: 'dA', trait: '目标导向的' }, { id: 'd2', trait: '特别坚持原则的' },
        { id: 'd3', trait: '挑剔细节的' }, { id: 'd4', trait: '有掌控欲的' },
        { id: 'd5', trait: '遵守纪律的' }, { id: 'd6', trait: '有条不紊的' },
        { id: 'd7', trait: '有条理的' }, { id: 'd8', trait: '做事认真的' },
        { id: 'd9', trait: '做事系统化的' }, { id: 'd10', trait: '求胜心强的' },
        { id: 'dJ', trait: '直来直去的' }, { id: 'dQ', trait: '果断的' },
        { id: 'dK', trait: '发奋上进的' }, { id: 'sA', trait: '有独到见解的' },
        { id: 's2', trait: '批判性思维的' }, { id: 's3', trait: '有怀疑精神的' },
        { id: 's4', trait: '博而不精的' }, { id: 's5', trait: '理性的' },
        { id: 's6', trait: '现实的' }, { id: 's7', trait: '讲证据的' },
        { id: 's8', trait: '爱分析的' }, { id: 's9', trait: '敏锐的' },
        { id: 's10', trait: '讲究逻辑的' }, { id: 'sJ', trait: '喜欢抽象思考的' },
        { id: 'sQ', trait: '博学的' }, { id: 'sK', trait: '某领域有专长的' }
    ];
    // 创建一个Map，用于通过卡牌ID快速查找其个性描述词，提高性能
    const cardTraitMap = new Map(cardData.map(card => [card.id, card.trait]));

    // --- 事件监听器 ---
    // 绑定“开始游戏”按钮的点击事件到 `initializeGame` 函数
    startBtn.addEventListener('click', initializeGame);
    // 绑定牌堆元素的点击事件到 `handleDrawCard` 函数
    deckElement.addEventListener('click', handleDrawCard);

    // --- 游戏主逻辑 ---
    /**
     * 初始化游戏
     * 在点击“开始游戏”按钮后调用此函数
     */
    function initializeGame() {
        const numPlayers = parseInt(playerCountSelect.value); // 获取选择的玩家数量

        // 重置所有游戏状态，以便重新开始游戏
        players = [];
        deck = [];
        discardPile = [];
        currentPlayerIndex = 0;
        isAwaitingPlayerAction = false;

        // 根据玩家数量创建玩家对象
        for (let i = 1; i <= numPlayers; i++) {
            players.push({ id: i, name: `玩家 ${i}`, hand: [] });
        }

        // 创建完整的52张牌的牌堆
        deck = cardData.map(card => card.id);
        shuffleDeck(); // 洗牌

        // 切换显示界面：隐藏设置界面，显示游戏主界面
        setupScreen.classList.add('d-none');
        gameScreen.classList.remove('d-none');

        // 渲染初始UI
        renderPlayers(); // 渲染所有玩家的区域
        updateDeckCount(); // 更新牌堆数量显示
        logMessage(`游戏开始，共有 ${numPlayers} 位玩家。`); // 记录日志
        highlightCurrentPlayer(); // 高亮显示第一个玩家
    }

    /**
     * 洗牌函数
     * 使用 Fisher-Yates (aka Knuth) 算法打乱牌堆数组
     */
    function shuffleDeck() {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]]; // ES6解构赋值交换元素
        }
    }

    /**
     * 处理抽牌动作
     * 当玩家点击牌堆时调用
     */
    function handleDrawCard() {
        // 如果当前正等待玩家对已抽的牌做决定，则阻止再次抽牌
        if (isAwaitingPlayerAction) {
            logMessage("请先处理您抽到的牌。", "warning");
            return;
        }

        // 如果牌堆为空，则检查弃牌堆
        if (deck.length === 0) {
            if (discardPile.length === 0) {
                // 如果弃牌堆也为空，游戏无法继续
                logMessage("牌堆和弃牌堆都已空！游戏无法继续。", "danger");
                return;
            }
            // 将弃牌堆的牌放回牌堆，并重新洗牌
            deck = [...discardPile];
            discardPile = [];
            shuffleDeck();
            logMessage("牌堆已空，正在重洗弃牌堆...", "info");
        }

        // 从牌堆顶部抽一张牌
        drawnCard = deck.pop();
        isAwaitingPlayerAction = true; // 设置状态锁

        logMessage(`${players[currentPlayerIndex].name} 抽到了 ${formatCard(drawnCard)}。`);

        // 更新UI
        updateDeckCount();
        renderDrawnCard(); // 显示抽到的牌和操作按钮
    }

    /**
     * 结束当前回合，轮到下一位玩家
     */
    function nextTurn() {
        // 重置与上一张抽出卡牌相关的状态
        drawnCard = null;
        isAwaitingPlayerAction = false;
        drawnCardArea.classList.add('d-none'); // 隐藏抽牌区域

        // 计算下一位玩家的索引
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        logMessage(`轮到 ${players[currentPlayerIndex].name}。`, "info");
        highlightCurrentPlayer(); // 更新UI高亮
    }

    // --- 玩家操作处理函数 ---
    /**
     * 玩家选择“保留”抽到的牌
     */
    function keepCard() {
        const player = players[currentPlayerIndex];
        // 如果手牌已满（5张）
        if (player.hand.length >= 5) {
            logMessage("手牌已满。请选择一张牌丢弃以保留新牌。", "warning");
            // 提示玩家选择一张手牌进行丢弃，并提供一个回调函数
            // 这个回调函数会在玩家选择丢弃一张牌后执行
            promptDiscard(player, () => {
                player.hand.push(drawnCard); // 将新抽的牌加入手牌
                logMessage(`${player.name} 保留了 ${formatCard(drawnCard)}。`);
                renderPlayerHand(player); // 重新渲染玩家手牌
                nextTurn(); // 轮到下一位玩家
            });
        } else {
            // 如果手牌未满，直接加入手牌
            player.hand.push(drawnCard);
            logMessage(`${player.name} 保留了 ${formatCard(drawnCard)}。`);
            renderPlayerHand(player);
            nextTurn();
        }
    }

    /**
     * 玩家选择“丢弃”抽到的牌
     */
    function discardDrawnCard() {
        logMessage(`${players[currentPlayerIndex].name} 丢弃了 ${formatCard(drawnCard)}。`);
        discardPile.push(drawnCard); // 将牌放入弃牌堆
        nextTurn();
    }

    /**
     * 玩家选择“赠送”抽到的牌
     */
    function giveCard() {
        const player = players[currentPlayerIndex];
        const cardToGive = drawnCard;

        // 生成可供选择的接收者按钮
        const recipientOptions = players
            .filter(p => p.id !== player.id) // 过滤掉自己
            .map(p => `<button class="btn btn-outline-secondary btn-sm m-1" onclick="confirmGive(${p.id})">${p.name}</button>`)
            .join('');

        if (recipientOptions) {
            // 在抽牌操作区显示接收者选项
            drawnCardActions.innerHTML = `
                <p class="mb-2">要赠送给谁？</p>
                ${recipientOptions}
                <button class="btn btn-danger btn-sm mt-2" onclick="window.cancelGive()">取消</button>
            `;
        } else {
            logMessage("没有其他玩家可以赠送。", "warning");
        }
    }

    /**
     * 取消赠送操作，返回到初始的“保留/赠送/丢弃”选项
     * 这个函数需要挂载到 window 对象上，才能被HTML中的onclick调用
     */
    window.cancelGive = function () {
        renderDrawnCard(); // 重新渲染抽牌区域的初始按钮
    }

    /**
     * 确认赠送对象后，向接收者显示“接受/拒绝”选项
     */
    window.confirmGive = function (recipientId) {
        const giver = players[currentPlayerIndex];
        const recipient = players.find(p => p.id === recipientId);
        const card = drawnCard;

        logMessage(`${giver.name} 想要赠送 ${formatCard(card)} 给 ${recipient.name}。`);

        // 隐藏赠送者的操作按钮，等待接收者响应
        drawnCardArea.classList.add('d-none');
        isAwaitingPlayerAction = true; // 保持游戏等待状态

        // 在接收者的玩家卡片区域显示操作按钮
        const recipientCardElement = document.getElementById(`player-card-${recipient.id}`);
        const actionsDiv = recipientCardElement.querySelector('.player-actions');
        actionsDiv.innerHTML = `
            <p class="text-center fw-bold">收到来自 ${giver.name} 的 ${formatCard(card)}</p>
            <button class="btn btn-success btn-sm" onclick="acceptCard(${giver.id}, ${recipient.id}, '${card}')">接受</button>
            <button class="btn btn-danger btn-sm" onclick="declineCard(${giver.id}, ${recipient.id}, '${card}')">拒绝</button>
        `;

        // 赠送者的回合操作到此结束，清空drawnCard
        drawnCard = null;
        // isAwaitingPlayerAction 会在接收者操作后重置
    }

    /**
     * 接收者选择“接受”赠送的牌
     */
    window.acceptCard = function (giverId, recipientId, card) {
        const giver = players.find(p => p.id === giverId);
        const recipient = players.find(p => p.id === recipientId);

        logMessage(`${recipient.name} 接受了来自 ${giver.name} 的 ${formatCard(card)}。`);

        // 如果接收者手牌已满，同样需要提示其丢弃一张牌
        if (recipient.hand.length >= 5) {
            logMessage(`${recipient.name} 的手牌已满，需要选择一张丢弃。`, "warning");
            promptDiscard(recipient, () => {
                recipient.hand.push(card);
                renderPlayerHand(recipient);
                resetPlayerActions(recipient); // 清理接收者卡片上的“接受/拒绝”按钮
                nextTurn(); // 轮到下一位玩家
            });
        } else {
            recipient.hand.push(card);
            renderPlayerHand(recipient);
            resetPlayerActions(recipient);
            nextTurn();
        }
    }

    /**
     * 接收者选择“拒绝”赠送的牌
     */
    window.declineCard = function (giverId, recipientId, card) {
        const giver = players.find(p => p.id === giverId);
        const recipient = players.find(p => p.id === recipientId);

        logMessage(`${recipient.name} 拒绝了来自 ${giver.name} 的 ${formatCard(card)}。牌已丢弃。`);
        discardPile.push(card); // 被拒绝的牌进入弃牌堆
        resetPlayerActions(recipient); // 清理按钮
        nextTurn(); // 轮到下一位玩家
    }

    /**
     * 提示玩家从手牌中选择一张丢弃
     * @param {object} player - 需要丢牌的玩家对象
     * @param {function} onDiscardCallback - 丢牌成功后要执行的回调函数
     */
    function promptDiscard(player, onDiscardCallback) {
        logMessage(`请 ${player.name} 从手牌中选择一张丢弃。`);
        const handElement = document.getElementById(`player-hand-${player.id}`);
        const cards = handElement.querySelectorAll('.playing-card');

        // 为手牌添加可选择的样式和点击事件
        cards.forEach(cardElement => {
            cardElement.classList.add('selectable');
            cardElement.onclick = () => {
                const cardToDiscard = cardElement.dataset.cardId;

                // 从玩家手牌数据中移除
                player.hand = player.hand.filter(c => c !== cardToDiscard);
                // 将丢弃的牌放入弃牌堆
                discardPile.push(cardToDiscard);
                logMessage(`${player.name} 丢弃了 ${formatCard(cardToDiscard)}。`);

                // 清理所有手牌的点击事件和样式，防止误操作
                cards.forEach(c => {
                    c.classList.remove('selectable');
                    c.onclick = null;
                });

                renderPlayerHand(player); // 重新渲染手牌UI
                onDiscardCallback(); // 执行后续逻辑（例如，将新牌加入手牌）
            };
        });
    }


    // --- UI 渲染函数 ---
    /**
     * 渲染所有玩家的卡片区域框架
     */
    function renderPlayers() {
        playersArea.innerHTML = '';
        players.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'col-md-6 mb-4';
            playerDiv.innerHTML = `
                <div class="card shadow-sm player-card" id="player-card-${player.id}">
                    <div class="card-header d-flex justify-content-between">
                        <span>${player.name}</span>
                        <span>手牌: <span id="hand-count-${player.id}">0</span>/5</span>
                    </div>
                    <div class="card-body">
                        <div class="player-hand" id="player-hand-${player.id}">
                           <p class="text-muted">空</p>
                        </div>
                        <div class="player-actions mt-2"></div>
                    </div>
                </div>
            `;
            playersArea.appendChild(playerDiv);
            renderPlayerHand(player); // 渲染每个玩家的初始手牌（为空）
        });
    }

    /**
     * 渲染指定玩家的手牌
     * @param {object} player - 要渲染手牌的玩家对象
     */
    function renderPlayerHand(player) {
        const handElement = document.getElementById(`player-hand-${player.id}`);
        const handCountElement = document.getElementById(`hand-count-${player.id}`);
        handElement.innerHTML = '';

        if (player.hand.length === 0) {
            handElement.innerHTML = '<p class="text-muted align-self-center">空</p>';
        } else {
            player.hand.forEach(cardId => {
                const cardElement = createCardElement(cardId);
                handElement.appendChild(cardElement);
            });
        }
        handCountElement.textContent = player.hand.length; // 更新手牌数量显示
    }

    /**
     * 渲染刚抽到的牌以及对应的操作按钮
     */
    function renderDrawnCard() {
        drawnCardDisplay.innerHTML = '';
        drawnCardDisplay.appendChild(createCardElement(drawnCard));

        const canGive = players.length > 1; // 只有多于一个玩家时才能赠送
        drawnCardActions.innerHTML = `
            <button class="btn btn-success" onclick="window.keepCard()">保留</button>
            ${canGive ? '<button class="btn btn-primary" onclick="window.giveCard()">赠送</button>' : ''}
            <button class="btn btn-warning" onclick="window.discardDrawnCard()">丢弃</button>
        `;
        // 将这些函数挂载到 window 对象上，以便HTML中的 onclick 可以调用它们
        window.keepCard = keepCard;
        window.giveCard = giveCard;
        window.discardDrawnCard = discardDrawnCard;

        drawnCardArea.classList.remove('d-none'); // 显示抽牌区域
    }

    /**
     * 清空玩家卡片上的操作按钮区域
     * @param {object} player - 目标玩家对象
     */
    function resetPlayerActions(player) {
        const actionsDiv = document.getElementById(`player-card-${player.id}`).querySelector('.player-actions');
        actionsDiv.innerHTML = '';
    }

    /**
     * 高亮显示当前回合的玩家
     */
    function highlightCurrentPlayer() {
        // 移除所有玩家卡片的 'active' 类
        document.querySelectorAll('.player-card').forEach(card => card.classList.remove('active'));
        // 为当前玩家的卡片添加 'active' 类
        document.getElementById(`player-card-${players[currentPlayerIndex].id}`).classList.add('active');
    }

    /**
     * 更新牌堆剩余数量的显示
     */
    function updateDeckCount() {
        deckCountElement.textContent = deck.length;
    }

    /**
     * 创建一张扑克牌的HTML元素
     * @param {string} cardId - 卡牌ID (例如 'hA', 's10')
     * @returns {HTMLElement} - 代表这张牌的div元素
     */
    function createCardElement(cardId) {
        const suitChar = cardId.charAt(0).toLowerCase();
        const rank = cardId.substring(1).toUpperCase();
        const trait = cardTraitMap.get(cardId) || "";

        const suitInfo = {
            's': { symbol: '♠', color: 'black' },
            'h': { symbol: '♥', color: 'red' },
            'd': { symbol: '♦', color: 'red' },
            'c': { symbol: '♣', color: 'black' }
        };

        const { symbol, color } = suitInfo[suitChar];

        const cardDiv = document.createElement('div');
        cardDiv.className = `playing-card ${color}`;
        cardDiv.dataset.cardId = cardId; // 将卡牌ID存储在data属性中，方便后续操作
        cardDiv.innerHTML = `
            <div class="top-left"><div>${rank}</div><div>${symbol}</div></div>
            <div class="suit">${symbol}</div>
            <div class="trait">${trait}</div>
            <div class="bottom-right"><div>${rank}</div><div>${symbol}</div></div>
        `;
        return cardDiv;
    }

    /**
     * 在游戏日志区域添加一条消息
     * @param {string} message - 要显示的消息
     * @param {string} type - 消息类型 (如 'default', 'info', 'warning', 'danger')，用于着色
     */
    function logMessage(message, type = 'default') {
        const p = document.createElement('p');
        p.innerHTML = message; // 使用 innerHTML 是为了能正确渲染 formatCard 返回的带样式的HTML字符串
        p.className = `text-${type}`;
        gameLog.appendChild(p);
        gameLog.scrollTop = gameLog.scrollHeight; // 自动滚动到日志底部
    }

    /**
     * 格式化卡牌ID，使其在日志中以带颜色和符号的形式显示
     * @param {string} cardId - 卡牌ID
     * @returns {string} - 格式化后的HTML字符串
     */
    function formatCard(cardId) {
        const suitInfo = {
            's': { symbol: '♠', color: 'black' },
            'h': { symbol: '♥', color: 'red' },
            'd': { symbol: '♦', color: 'red' },
            'c': { symbol: '♣', color: 'black' }
        };
        const suitChar = cardId.charAt(0).toLowerCase();
        const rank = cardId.substring(1).toUpperCase();
        const { symbol, color } = suitInfo[suitChar];
        return `<span class="${color}" style="font-weight:bold;">${rank}${symbol}</span>`;
    }
});
