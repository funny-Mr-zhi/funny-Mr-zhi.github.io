document.addEventListener('DOMContentLoaded', () => {
    const submitBtn = document.getElementById('submit-btn');
    const cardInputs = document.querySelectorAll('.form-control.card-input');
    const cardDisplayArea = document.getElementById('card-display-area');
    const resultsArea = document.getElementById('results-area');
    const inputError = document.getElementById('input-error');

    const cardData = [
        { id: 'ha', trait: '善于活跃气氛的' }, { id: 'h2', trait: '过于敏感的' },
        { id: 'h3', trait: '过于忍让的' }, { id: 'h4', trait: '爱热闹的' },
        { id: 'h5', trait: '体贴周到的' }, { id: 'h6', trait: '忠诚的' },
        { id: 'h7', trait: '富于同情心的' }, { id: 'h8', trait: '善解人意的' },
        { id: 'h9', trait: '热心肠的' }, { id: 'h10', trait: '人缘好的' },
        { id: 'hj', trait: '合群的' }, { id: 'hq', trait: '喜欢交朋友的' },
        { id: 'hk', trait: '处事圆润的' }, { id: 'ca', trait: '喜欢冒险的' },
        { id: 'c2', trait: '注意力分散的' }, { id: 'c3', trait: '不受约束的' },
        { id: 'c4', trait: '冲动的' }, { id: 'c5', trait: '好奇心强的' },
        { id: 'c6', trait: '别出心裁的' }, { id: 'c7', trait: '思想开放的' },
        { id: 'c8', trait: '爱幻想的' }, { id: 'c9', trait: '有创造力的' },
        { id: 'c10', trait: '爱好广泛的' }, { id: 'cj', trait: '灵活的' },
        { id: 'cq', trait: '敢说敢做的' }, { id: 'ck', trait: '心血来潮的' },
        { id: 'da', trait: '目标导向的' }, { id: 'd2', trait: '特别坚持原则的' },
        { id: 'd3', trait: '挑剔细节的' }, { id: 'd4', trait: '有掌控欲的' },
        { id: 'd5', trait: '遵守纪律的' }, { id: 'd6', trait: '有条不紊的' },
        { id: 'd7', trait: '有条理的' }, { id: 'd8', trait: '做事认真的' },
        { id: 'd9', trait: '做事系统化的' }, { id: 'd10', trait: '求胜心强的' },
        { id: 'dj', trait: '直来直去的' }, { id: 'dq', trait: '果断的' },
        { id: 'dk', trait: '发奋上进的' }, { id: 'sa', trait: '有独到见解的' },
        { id: 's2', trait: '批判性思维的' }, { id: 's3', trait: '有怀疑精神的' },
        { id: 's4', trait: '博而不精的' }, { id: 's5', trait: '理性的' },
        { id: 's6', trait: '现实的' }, { id: 's7', trait: '讲证据的' },
        { id: 's8', trait: '爱分析的' }, { id: 's9', trait: '敏锐的' },
        { id: 's10', trait: '讲究逻辑的' }, { id: 'sj', trait: '喜欢抽象思考的' },
        { id: 'sq', trait: '博学的' }, { id: 'sk', trait: '某领域有专长的' }
    ];

    const cardTraitMap = new Map(cardData.map(card => [card.id.toLowerCase(), card.trait]));

    submitBtn.addEventListener('click', () => {
        const cardsInHand = Array.from(cardInputs).map(input => input.value.trim().toLowerCase()).filter(val => val);

        if (cardsInHand.length !== 5) {
            showError("请输入全部五张牌。");
            return;
        }

        const invalidCards = cardsInHand.filter(card => !isValidCard(card));
        if (invalidCards.length > 0) {
            showError(`无效的卡牌代码: ${invalidCards.join(', ')}。请使用正确的格式 (例如: sA, h10, cK)。`);
            return;
        }

        hideError();
        renderCards(cardsInHand);
        analyzeAndDisplayResults(cardsInHand);
    });

    function isValidCard(card) {
        if (card.length < 2 || card.length > 3) return false;
        const suit = card.charAt(0);
        const rank = card.substring(1);
        if (!['s', 'h', 'd', 'c'].includes(suit)) return false;
        if (!['a', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k'].includes(rank)) return false;
        return true;
    }

    function showError(message) {
        inputError.textContent = message;
        inputError.classList.remove('d-none');
    }

    function hideError() {
        inputError.classList.add('d-none');
    }

    function renderCards(cards) {
        cardDisplayArea.innerHTML = '';
        cards.forEach(cardId => {
            const cardElement = createCardElement(cardId);
            cardDisplayArea.appendChild(cardElement);
        });
    }

    function createCardElement(cardId) {
        const suitChar = cardId.charAt(0);
        const rank = cardId.substring(1).toUpperCase();
        const trait = cardTraitMap.get(cardId) || "未知特质";

        const suitInfo = {
            's': { symbol: '♠', color: 'black' },
            'h': { symbol: '♥', color: 'red' },
            'd': { symbol: '♦', color: 'red' },
            'c': { symbol: '♣', color: 'black' }
        };

        const { symbol, color } = suitInfo[suitChar];

        const cardDiv = document.createElement('div');
        cardDiv.className = `playing-card ${color}`;
        cardDiv.innerHTML = `
            <div class="top-left"><div>${rank}</div><div>${symbol}</div></div>
            <div class="suit">${symbol}</div>
            <div class="trait" style="font-size: 14px; text-align: center; font-weight: normal;">${trait}</div>
            <div class="bottom-right"><div>${rank}</div><div>${symbol}</div></div>
        `;
        return cardDiv;
    }

    function analyzeAndDisplayResults(cardsInHand) {
        resultsArea.innerHTML = '<h2 class="text-center mb-4">分析结果</h2>'; // Clear previous results

        // 1. Color Analysis
        const brainResult = brainSection(cardsInHand);
        if (brainResult) {
            displayResult("颜色 (左脑/右脑)", brainResult.text);
        }

        // 2. Primary Strong Suit
        const primarySuit = getPrimary(cardsInHand);
        const primarySuitResult = analysisDataCN.getPrimaryStrongSuit(primarySuit);
        displayResult(primarySuitResult.title, primarySuitResult.content);

        // 3. High/Low Strong Suit
        const highLowResult = highLowStrongSuitSection(cardsInHand, primarySuit);
        if (highLowResult) {
            displayResult(highLowResult.title, highLowResult.content);
        }

        // 4. Introvert/Extrovert
        const introExtroResult = intoExtroSection(cardsInHand);
        if (introExtroResult) {
            displayResult(introExtroResult.title, introExtroResult.content);
        }

        // 5. Secondary Suit
        const secondaryResult = secondarySection(cardsInHand, primarySuit);
        if (secondaryResult) {
            displayResult(secondaryResult.title, secondaryResult.content);
        }

        // 6. Opposite Suit
        const oppositeResult = oppositeSection(cardsInHand, primarySuit);
        if (oppositeResult) {
            displayResult(oppositeResult.title, oppositeResult.content);
        }

        resultsArea.classList.remove('d-none');
    }

    function displayResult(title, content) {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'result-section';
        sectionDiv.innerHTML = `<h3>${title}</h3><div>${content}</div>`;
        resultsArea.appendChild(sectionDiv);
    }

    // --- Analysis Logic (adapted from Result.js) ---

    function brainSection(cardsInHand) {
        let blackKeys = 0;
        let redKeys = 0;
        cardsInHand.forEach(card => {
            if (card[0] === 'c' || card[0] === 's') blackKeys++;
            else if (card[0] === 'd' || card[0] === 'h') redKeys++;
        });

        let type;
        if (blackKeys === 3) type = '3black';
        else if (blackKeys === 4) type = '4black';
        else if (blackKeys === 5) type = '5black';
        else if (redKeys === 3) type = '3red';
        else if (redKeys === 4) type = '4red';
        else if (redKeys === 5) type = '5red';

        return type ? analysisDataCN.getColor(type) : null;
    }

    function getPrimary(cardsInHand) {
        let counts = { 'd': 0, 'h': 0, 's': 0, 'c': 0 };
        cardsInHand.forEach(card => counts[card[0]]++);

        if (counts.c >= 3) return "clubs";
        if (counts.s >= 3) return "spades";
        if (counts.h >= 3) return "hearts";
        if (counts.d >= 3) return "diamonds";

        if (counts.c === 2) return "clubs";
        if (counts.s === 2) return "spades";
        if (counts.h === 2) return "hearts";
        if (counts.d === 2) return "diamonds";

        if (counts.c === 0) return "diamonds";
        if (counts.s === 0) return "hearts";
        if (counts.h === 0) return "spades";
        if (counts.d === 0) return "clubs";

        return "diamonds"; // Default fallback
    }

    function highLowStrongSuitSection(cardsInHand, primary) {
        let high = 0, low = 0, primaryCount = 0;
        const primarySuitChar = primary.charAt(0);

        cardsInHand.forEach(card => {
            if (card[0] === primarySuitChar) {
                primaryCount++;
                const rank = card.substring(1);
                if (['5', '6', '7', '8', '9'].includes(rank)) low++;
                else if (['10', 'j', 'q', 'k', 'a'].includes(rank)) high++;
            }
        });

        if (primaryCount > 1) {
            let highLowSuit;
            const suitMap = { "spades": "s", "hearts": "h", "clubs": "c", "diamonds": "d" };
            if (low > high) {
                highLowSuit = "low" + suitMap[primary];
            } else if (high > low) {
                highLowSuit = "high" + suitMap[primary];
            }
            return highLowSuit ? analysisDataCN.getHighOrLow(highLowSuit) : null;
        }
        return null;
    }

    function intoExtroSection(cardsInHand) {
        let high = 0, low = 0;
        cardsInHand.forEach(card => {
            const rank = card.substring(1);
            if (['5', '6', '7', '8', '9'].includes(rank)) low++;
            else if (['10', 'j', 'q', 'k', 'a'].includes(rank)) high++;
        });

        let introOrExtro;
        if (high >= 3) introOrExtro = "Extrovert";
        else if (low >= 3) introOrExtro = "Introvert";

        return introOrExtro ? analysisDataCN.getIntroOrExtro(introOrExtro) : null;
    }

    function secondarySection(cardsInHand, primary) {
        let counts = { 'd': 0, 'h': 0, 's': 0, 'c': 0 };
        cardsInHand.forEach(card => counts[card[0]]++);

        let secondarySuits = [];
        if (counts.c > 0 && primary !== "clubs" && primary !== "diamonds") secondarySuits.push("clubs");
        if (counts.s > 0 && primary !== "spades" && primary !== "hearts") secondarySuits.push("spades");
        if (counts.h > 0 && primary !== "hearts" && primary !== "spades") secondarySuits.push("hearts");
        if (counts.d > 0 && primary !== "diamonds" && primary !== "clubs") secondarySuits.push("diamonds");

        if (secondarySuits.length > 0) {
            const content = secondarySuits.map(sec => analysisDataCN.getSecondary(sec).text).join('');
            return {
                title: "次要花色分析",
                content: `<p>除了您的主要强势花色外，您似乎还有一个或多个次要花色。这意味着您很难被归入一个类别。您可以在需要时随时调用您的次要优势。</p>${content}`
            };
        }
        return null;
    }

    function oppositeSection(cardsInHand, primary) {
        let counts = { 'd': 0, 'h': 0, 's': 0, 'c': 0 };
        cardsInHand.forEach(card => counts[card[0]]++);

        let opposite;
        if (primary === "hearts" && counts.s === 0) opposite = "spades";
        else if (primary === "spades" && counts.h === 0) opposite = "hearts";
        else if (primary === "clubs" && counts.d === 0) opposite = "diamonds";
        else if (primary === "diamonds" && counts.c === 0) opposite = "clubs";

        return opposite ? analysisDataCN.getOpposite(opposite) : null;
    }
});
