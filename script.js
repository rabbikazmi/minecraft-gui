// loading screen management
function initializeLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingText = document.querySelector('.loading-text');
    
    const loadingMessages = [
        "Loading blocks...",
        "Crafting recipes...", 
        "Spawning characters...",
        "Building inventory...",
        "Almost ready..."
    ];
    
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
        if (messageIndex < loadingMessages.length - 1) {
            messageIndex++;
            loadingText.textContent = loadingMessages[messageIndex];
        } else {
            clearInterval(messageInterval);
        }
    }, 600);
    setTimeout(() => {
        loadingScreen.style.animation = 'fadeOut 0.5s ease-out forwards';
        setTimeout(() => {
            loadingScreen.remove();
        }, 500);
    }, 3000);
}
// global variables for the click-based inventory system
let cursorItem = null; // the item currently being held by the cursor
let cursorQuantity = 0; // the quantity of the cursor item
let cursorElement = null; // the visual element following the cursor
let cursorQuantityElement = null; // the quantity text following the cursor

// character and speech bubble system
let currentCharacter = 'alex'; // default character
let speechBubbleTimeout = null;

// fun congratulatory messages for crafting
const craftingMessages = [
    "I made a thing!",
    "Nice!",
    "Awesome crafting skills!",
    "Woohoo!",
    "Crafted!",
    "Perfect creation!",
    "Sweet!",
    "Yes!",
    "Got it!",
    "Nailed it perfectly!",
    "Boom!",
    "Epic!",
    "Amazing work there!",
    "Cool!",
    "Great job!"
];

// sound system using tone.js
let audioContext = null;
let synth = null;

// recipe database
const recipes = [
    {
        output: { name: 'oak_planks', quantity: 4, image: 'images/oak_planks.png' },
        pattern: ['oak_log', null, null, null]
    },
    {
        output: { name: 'stick', quantity: 4, image: 'images/stick.png' },
        pattern: ['oak_planks', 'oak_planks', null, null]
    },
    {
        output: { name: 'crafting_table', quantity: 1, image: 'images/crafting_table.png' },
        pattern: ['oak_planks', 'oak_planks', 'oak_planks', 'oak_planks']
    },
    {
        output: { name: 'furnace', quantity: 1, image: 'images/furnace.png' },
        pattern: ['cobblestone', 'cobblestone', 'cobblestone', 'cobblestone']
    },
    {
        output: { name: 'torch', quantity: 4, image: 'images/torch.png' },
        pattern: ['coal', 'stick', null, null]
    },
    {
        output: { name: 'chest', quantity: 1, image: 'images/chest.png' },
        pattern: ['oak_planks', 'oak_planks', 'oak_planks', 'oak_planks']
    },
    {
        output: { name: 'bowl', quantity: 1, image: 'images/bowl.png' },
        pattern: ['oak_planks', null, 'oak_planks', 'oak_planks']
    },
    {
        output: { name: 'mushroom_stew', quantity: 1, image: 'images/mushroom_stew.png' },
        pattern: ['red_mushroom', 'brown_mushroom', 'bowl', null]
    },
    {
        output: { name: 'bread', quantity: 1, image: 'images/bread.png' },
        pattern: ['wheat', 'wheat', 'wheat', null]
    },
    {
        output: { name: 'cake', quantity: 1, image: 'images/cake.png' },
        pattern: ['bread', 'bread', 'sugarcane', 'sugarcane']
    },
    {
        output: { name: 'map', quantity: 1, image: 'images/map.png' },
        pattern: ['paper', 'paper', 'paper', 'paper']
    },
    {
        output: { name: 'firework_rocket', quantity: 3, image: 'images/firework_rocket.png' },
        pattern: ['paper', 'coal', null, null]
    }
];

function initAudio() {
    try {
        if (Tone.context.state !== 'running') {
            Tone.start();
        }
        audioContext = Tone.getContext();
        synth = new Tone.Synth().toDestination();
    } catch (error) {
        console.log('Audio initialization failed:', error);
    }
}

function playSound(frequency = 440, duration = 0.1) {
    try {
        if (synth && Tone.context.state === 'running') {
            synth.triggerAttackRelease(frequency, duration);
        }
    } catch (error) {
        console.log('Sound playback failed:', error);
    }
}

// character and speech bubble system
function showSpeechBubble(message) {
    let speechBubble;
    
    // get the correct speech bubble based on current character
    if (currentCharacter === 'alex') {
        speechBubble = document.getElementById('speech-bubble-alex');
    } else {
        speechBubble = document.getElementById('speech-bubble-sunny');
    }
    
    const speechText = speechBubble.querySelector('.speech-text');
    if (speechBubbleTimeout) {
        clearTimeout(speechBubbleTimeout);
    }
    
    speechText.textContent = message;
    speechBubble.classList.remove('hidden');
    speechBubble.style.animation = 'bubbleAppear 0.3s ease-out';
    speechBubbleTimeout = setTimeout(() => {
        speechBubble.style.animation = 'bubbleDisappear 0.3s ease-out';
        setTimeout(() => {
            speechBubble.classList.add('hidden');
        }, 300);
    }, 2000);
}

function getRandomCraftingMessage() {
    const randomIndex = Math.floor(Math.random() * craftingMessages.length);
    return craftingMessages[randomIndex];
}

function switchCharacter(characterName) {
    console.log('Switching to:', characterName); 
    currentCharacter = characterName;
    const alexChar = document.getElementById('alex-character');
    const sunnyChar = document.getElementById('sunny-character');
    
    alexChar.classList.remove('active');
    sunnyChar.classList.remove('active');
    
    // show the selected character
    const selectedCharacter = document.getElementById(`${characterName}-character`);
    if (selectedCharacter) {
        selectedCharacter.classList.add('active');
        console.log('Activated character:', characterName); 
    } else {
        console.error('Character not found:', characterName); 
    }

    document.querySelectorAll('.character-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeButton = document.querySelector(`[data-character="${characterName}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

function setupCharacterSelection() {
    const characterButtons = document.querySelectorAll('.character-btn');
    document.getElementById('alex-character').classList.remove('active');
    document.getElementById('sunny-character').classList.remove('active');
    
    // set alex as default active character
    document.getElementById('alex-character').classList.add('active');
    
    characterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const character = button.dataset.character;
            console.log('Switching to character:', character); 
            switchCharacter(character);
            playSound(659, 0.1); // E5 for character switch
        });
    });
}

// initialize grids and populate with items
function initializeInventory() {
    initAudio();
    
    // create inventory slots (18 slots = 2 rows of 9)
    const inventoryGrid = document.getElementById('inventory-grid');
    for (let i = 0; i < 18; i++) {
        const slot = createSlot(`inventory-${i}`);
        inventoryGrid.appendChild(slot);
    }

    // create hotbar slots (9 slots = 1 row)
    const hotbarGrid = document.getElementById('hotbar-grid');
    for (let i = 0; i < 9; i++) {
        const slot = createSlot(`hotbar-${i}`);
        hotbarGrid.appendChild(slot);
    }

    // create crafting slots (4 slots = 2x2 grid)
    const craftingGrid = document.getElementById('crafting-grid');
    for (let i = 0; i < 4; i++) {
        const slot = createSlot(`crafting-${i}`);
        craftingGrid.appendChild(slot);
    }

    // create crafting output slot
    const craftingOutput = document.getElementById('crafting-output');
    const outputSlot = createSlot('crafting-output-0');
    craftingOutput.appendChild(outputSlot);

    // create saved items slots (9 slots = 1 row)
    const savedItemsGrid = document.getElementById('saved-items-grid');
    for (let i = 0; i < 9; i++) {
        const slot = createSlot(`saved-${i}`);
        savedItemsGrid.appendChild(slot);
    }

    // add some starter items to the inventory
    addItemToSlot('inventory-0', 'oak_log', 8);
    addItemToSlot('inventory-1', 'cobblestone', 32);
    addItemToSlot('inventory-2', 'coal', 16);
    addItemToSlot('inventory-3', 'iron_ingot', 4);
    addItemToSlot('inventory-4', 'red_mushroom', 6);
    addItemToSlot('inventory-5', 'brown_mushroom', 4);
    addItemToSlot('inventory-6', 'bowl', 2);
    addItemToSlot('inventory-7', 'wheat', 12);
    addItemToSlot('inventory-8', 'sugarcane', 8);
    addItemToSlot('inventory-9', 'paper', 6);
    addItemToSlot('hotbar-0', 'stick', 12);
    addItemToSlot('hotbar-1', 'torch', 24);
    addItemToSlot('hotbar-2', 'oak_planks', 16);

    createCursorElements();
    setupCharacterSelection();
    setupEventListeners();
    setupRecipeBook();
    setupModalEvents();
}

function createSlot(id) {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.id = id;
    slot.addEventListener('click', handleSlotClick);
    slot.addEventListener('contextmenu', handleSlotRightClick);
    slot.addEventListener('mouseenter', showTooltip);
    slot.addEventListener('mouseleave', hideTooltip);
    return slot;
}

function createCursorElements() {
    cursorElement = document.createElement('img');
    cursorElement.className = 'cursor-item';
    cursorElement.style.display = 'none';
    document.body.appendChild(cursorElement);
    cursorQuantityElement = document.createElement('div');
    cursorQuantityElement.className = 'cursor-quantity';
    cursorQuantityElement.style.display = 'none';
    document.body.appendChild(cursorQuantityElement);

    document.addEventListener('mousemove', updateCursorPosition);
}

function updateCursorPosition(event) {
    if (cursorItem) {
        cursorElement.style.left = event.clientX + 'px';
        cursorElement.style.top = event.clientY + 'px';
        
        if (cursorQuantity > 1) {
            cursorQuantityElement.style.left = (event.clientX + 12) + 'px';
            cursorQuantityElement.style.top = (event.clientY + 12) + 'px';
        }
    }
}

function setCursorItem(item, quantity) {
    cursorItem = item;
    cursorQuantity = quantity;
    
    if (item) {
        cursorElement.src = `./images/${item}.png`;
        cursorElement.style.display = 'block';
        
        if (quantity > 1) {
            cursorQuantityElement.textContent = quantity;
            cursorQuantityElement.style.display = 'block';
        } else {
            cursorQuantityElement.style.display = 'none';
        }
    } else {
        cursorElement.style.display = 'none';
        cursorQuantityElement.style.display = 'none';
    }
}

function handleSlotClick(event) {
    event.preventDefault();
    const slot = event.currentTarget;
    const slotData = getSlotData(slot);
    const slotId = slot.id;
    
    const isCraftingSlot = slotId.startsWith('crafting-') && !slotId.includes('output');
    const isCraftingOutput = slotId === 'crafting-output-0';
    const isInventorySlot = slotId.startsWith('inventory-') || slotId.startsWith('hotbar-') || slotId.startsWith('saved-');
    
    if (isCraftingOutput && slotData.item && !cursorItem) {
        const message = getRandomCraftingMessage();
        showSpeechBubble(message);
    }
    
    if (cursorItem) {
        if (!slotData.item) {
            // empty slot
            if (isCraftingSlot) {
                // for crafting slots, place only ONE item
                setSlotData(slot, cursorItem, 1);
                if (cursorQuantity > 1) {
                    setCursorItem(cursorItem, cursorQuantity - 1);
                } else {
                    setCursorItem(null, 0);
                }
                playSound(523, 0.1); // C5
            } else {
                // for non-crafting slots, place the entire stack
                setSlotData(slot, cursorItem, cursorQuantity);
                setCursorItem(null, 0);
                playSound(523, 0.1); // C5
            }
        } else if (slotData.item === cursorItem) {
            // same item - try to combine stacks
            const maxStack = isCraftingSlot ? 1 : getMaxStackSize(cursorItem);
            const totalQuantity = slotData.quantity + cursorQuantity;
            
            if (isCraftingSlot && slotData.quantity >= 1) {
                // crafting slots can only hold 1 item, don't add more
                return;
            }
            
            if (totalQuantity <= maxStack) {
                // can combine completely
                setSlotData(slot, cursorItem, totalQuantity);
                setCursorItem(null, 0);
                playSound(523, 0.1); // C5
            } else {
                // partial combine
                setSlotData(slot, cursorItem, maxStack);
                setCursorItem(cursorItem, totalQuantity - maxStack);
                playSound(523, 0.1); // C5
            }
        } else {
            // different item - swap
            const tempItem = slotData.item;
            const tempQuantity = slotData.quantity;
            
            if (isCraftingSlot) {
                // for crafting slots, place only one of the cursor item
                setSlotData(slot, cursorItem, 1);
                // combine the picked up item with existing cursor items
                if (tempItem === cursorItem) {
                    setCursorItem(cursorItem, cursorQuantity + tempQuantity - 1);
                } else {
                    setCursorItem(tempItem, tempQuantity);
                }
            } else {
                setSlotData(slot, cursorItem, cursorQuantity);
                setCursorItem(tempItem, tempQuantity);
            }
            playSound(440, 0.1); // A4
        }
    } else {
        // player is not holding an item
        if (slotData.item) {
            if (isInventorySlot && event.shiftKey) {
                // shift+click: take only ONE item from inventory/hotbar/saved slots
                setCursorItem(slotData.item, 1);
                if (slotData.quantity > 1) {
                    setSlotData(slot, slotData.item, slotData.quantity - 1);
                } else {
                    clearSlot(slot);
                }
                playSound(440, 0.1); // A4
            } else {
                // normal click: Pick up the entire stack
                setCursorItem(slotData.item, slotData.quantity);
                clearSlot(slot);
                playSound(440, 0.1); // A4
            }
        }
    }
    
    updateCraftingResult();
}

function handleSlotRightClick(event) {
    event.preventDefault();
    const slot = event.currentTarget;
    const slotData = getSlotData(slot);
    const slotId = slot.id;
    const isCraftingSlot = slotId.startsWith('crafting-') && !slotId.includes('output');
    const isInventorySlot = slotId.startsWith('inventory-') || slotId.startsWith('hotbar-') || slotId.startsWith('saved-');
    
    if (cursorItem) {
        // player is holding an item
        if (!slotData.item) {
            // empty slot - place one item
            setSlotData(slot, cursorItem, 1);
            if (cursorQuantity > 1) {
                setCursorItem(cursorItem, cursorQuantity - 1);
            } else {
                setCursorItem(null, 0);
            }
            playSound(659, 0.1); // E5
        } else if (slotData.item === cursorItem) {
            // same item - add one if possible
            const maxStack = isCraftingSlot ? 1 : getMaxStackSize(cursorItem);
            if (slotData.quantity < maxStack) {
                setSlotData(slot, cursorItem, slotData.quantity + 1);
                if (cursorQuantity > 1) {
                    setCursorItem(cursorItem, cursorQuantity - 1);
                } else {
                    setCursorItem(null, 0);
                }
                playSound(659, 0.1); // E5
            }
        }
    } else {
        // player is not holding an item
        if (slotData.item) {
            if (isInventorySlot) {
                // for inventory slots: Right-click takes ONLY ONE item
                setCursorItem(slotData.item, 1);
                if (slotData.quantity > 1) {
                    setSlotData(slot, slotData.item, slotData.quantity - 1);
                } else {
                    clearSlot(slot);
                }
                playSound(493, 0.1); // B4
            } else if (slotData.quantity > 1) {
                // for other slots: Pick up half the stack (rounded up)
                const halfQuantity = Math.ceil(slotData.quantity / 2);
                const remainingQuantity = slotData.quantity - halfQuantity;
                
                setCursorItem(slotData.item, halfQuantity);
                setSlotData(slot, slotData.item, remainingQuantity);
                playSound(493, 0.1); // B4
            } else {
                // only one item - pick it up
                setCursorItem(slotData.item, 1);
                clearSlot(slot);
                playSound(493, 0.1); // B4
            }
        }
    }
    
    updateCraftingResult();
}

function getSlotData(slot) {
    const img = slot.querySelector('img');
    const quantityText = slot.querySelector('.quantity-text');
    
    if (img) {
        const item = img.src.split('/').pop().replace('.png', '');
        const quantity = quantityText ? parseInt(quantityText.textContent) : 1;
        return { item, quantity };
    }
    
    return { item: null, quantity: 0 };
}

function setSlotData(slot, item, quantity) {
    clearSlot(slot);
    
    if (item && quantity > 0) {
        const img = document.createElement('img');
        img.src = `./images/${item}.png`;
        img.alt = item;
        slot.appendChild(img);
        slot.classList.add('has-item');
        
        if (quantity > 1) {
            const quantityText = document.createElement('div');
            quantityText.className = 'quantity-text';
            quantityText.textContent = quantity;
            slot.appendChild(quantityText);
        }
    }
}

function clearSlot(slot) {
    slot.innerHTML = '';
    slot.classList.remove('has-item');
}

function addItemToSlot(slotId, item, quantity) {
    const slot = document.getElementById(slotId);
    if (slot) {
        setSlotData(slot, item, quantity);
    }
}

function getMaxStackSize(item) {
    // most items stack to 64, but some have different limits
    const stackSizes = {
        'torch': 64,
        'stick': 64,
        'mushroom_stew': 1, 
        'coal': 64,
        'iron_ingot': 64,
        'oak_log': 64,
        'oak_planks': 64,
        'cobblestone': 64,
        'brown_mushroom': 64,
        'red_mushroom': 64,
        'bowl': 64,
        'crafting_table': 64,
        'furnace': 64,
        'chest': 64
    };
    
    return stackSizes[item] || 64;
}

// crafting system
function updateCraftingResult() {
    const craftingSlots = [
        document.getElementById('crafting-0'),
        document.getElementById('crafting-1'),
        document.getElementById('crafting-2'),
        document.getElementById('crafting-3')
    ];
    
    const pattern = craftingSlots.map(slot => {
        const slotData = getSlotData(slot);
        return slotData.item || null;
    });
    
    const outputSlot = document.getElementById('crafting-output-0');
    
    // check if pattern matches any recipe
    const matchedRecipe = recipes.find(recipe => {
        return recipe.pattern.every((item, index) => item === pattern[index]);
    });
    
    if (matchedRecipe) {
        setSlotData(outputSlot, matchedRecipe.output.name, matchedRecipe.output.quantity);
        outputSlot.classList.add('craftable');
    } else {
        clearSlot(outputSlot);
        outputSlot.classList.remove('craftable');
    }
}

function handleCraftButtonClick() {
    const outputSlot = document.getElementById('crafting-output-0');
    const outputData = getSlotData(outputSlot);
    
    if (outputData.item) {
        if (!cursorItem) {
            setCursorItem(outputData.item, outputData.quantity);
            
            // show speech bubble for successful crafting
            const message = getRandomCraftingMessage();
            showSpeechBubble(message);
            
            // consume crafting materials
            consumeCraftingMaterials();
            clearSlot(outputSlot);
            updateCraftingResult();
            playSound(587, 0.2); // D5
        } else if (cursorItem === outputData.item) {
            // same item - try to add to cursor
            const maxStack = getMaxStackSize(cursorItem);
            if (cursorQuantity + outputData.quantity <= maxStack) {
                setCursorItem(cursorItem, cursorQuantity + outputData.quantity);
                
                // show speech bubble for successful crafting
                const message = getRandomCraftingMessage();
                showSpeechBubble(message);
                
                // consume crafting materials
                consumeCraftingMaterials();
                clearSlot(outputSlot);
                updateCraftingResult();
                playSound(587, 0.2); // D5
            }
        }
    }
}

function consumeCraftingMaterials() {
    const craftingSlots = [
        document.getElementById('crafting-0'),
        document.getElementById('crafting-1'),
        document.getElementById('crafting-2'),
        document.getElementById('crafting-3')
    ];
    
    craftingSlots.forEach(slot => {
        const slotData = getSlotData(slot);
        if (slotData.item) {
            if (slotData.quantity > 1) {
                setSlotData(slot, slotData.item, slotData.quantity - 1);
            } else {
                clearSlot(slot);
            }
        }
    });
}

// reset function
function resetInventory() {
    document.querySelectorAll('.slot').forEach(slot => {
        clearSlot(slot);
    });
    
    setCursorItem(null, 0);
    
    addItemToSlot('inventory-0', 'oak_log', 8);
    addItemToSlot('inventory-1', 'cobblestone', 32);
    addItemToSlot('inventory-2', 'coal', 16);
    addItemToSlot('inventory-3', 'iron_ingot', 4);
    addItemToSlot('inventory-4', 'red_mushroom', 6);
    addItemToSlot('inventory-5', 'brown_mushroom', 4);
    addItemToSlot('inventory-6', 'bowl', 2);
    addItemToSlot('hotbar-0', 'stick', 12);
    addItemToSlot('hotbar-1', 'torch', 24);
    addItemToSlot('hotbar-2', 'oak_planks', 16);
    
    playSound(330, 0.3); // E4
}

// tooltip system
function showTooltip(event) {
    const slot = event.currentTarget;
    const slotData = getSlotData(slot);
    
    if (slotData.item) {
        removeExistingTooltips();
        
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = formatItemName(slotData.item);
        
        // special styling for rare items
        if (['mushroom_stew', 'iron_ingot'].includes(slotData.item)) {
            tooltip.classList.add('rare');
        }
        
        document.body.appendChild(tooltip);
        
        const rect = slot.getBoundingClientRect();
        tooltip.style.left = rect.left + rect.width / 2 + 'px';
        tooltip.style.top = rect.top + 'px';
    }
}

function hideTooltip() {
    removeExistingTooltips();
}

function removeExistingTooltips() {
    const existingTooltips = document.querySelectorAll('.tooltip');
    existingTooltips.forEach(tooltip => tooltip.remove());
}

function formatItemName(itemName) {
    return itemName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// recipe book and modal system
function setupRecipeBook() {
    const recipeBookBtn = document.getElementById('recipe-book-btn');
    const recipeBookModal = document.getElementById('recipe-book-modal');
    const homeBtn = document.getElementById('home-btn');
    const aboutModal = document.getElementById('about-modal');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const closeButtons = document.querySelectorAll('.close');
    
    // recipe book modal
    recipeBookBtn.addEventListener('click', () => {
        generateRecipeBook();
        recipeBookModal.style.display = 'block';
        playSound(698, 0.1); // F5 for recipe book
        showSpeechBubble("Let's see what we can craft! ");
    });
    
    // About modal
    homeBtn.addEventListener('click', () => {
        aboutModal.style.display = 'block';
        playSound(784, 0.1); // G5 for about
        showSpeechBubble("Welcome to my amazing crafting world! Check out all the cool features! ");
    });
    
    // theme toggle
    themeToggleBtn.addEventListener('click', toggleTheme);
    
    // close buttons for all modals
    closeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const modal = event.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                playSound(523, 0.1); // C5 for closing
            }
        });
    });
    
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
            playSound(523, 0.1); // C5 for closing
        }
    });
}

function generateRecipeBook() {
    const recipesContainer = document.getElementById('recipes-container');
    recipesContainer.innerHTML = '';
    
    recipes.forEach(recipe => {
        const recipeItem = document.createElement('div');
        recipeItem.className = 'recipe-item';
        
        const recipeHeader = document.createElement('div');
        recipeHeader.className = 'recipe-header';
        
        const recipeOutput = document.createElement('div');
        recipeOutput.className = 'recipe-output';
        
        const outputImg = document.createElement('img');
        outputImg.src = recipe.output.image;
        outputImg.alt = recipe.output.name;
        recipeOutput.appendChild(outputImg);
        
        const recipeName = document.createElement('div');
        recipeName.className = 'recipe-name';
        recipeName.textContent = formatItemName(recipe.output.name);
        
        recipeHeader.appendChild(recipeOutput);
        recipeHeader.appendChild(recipeName);
        
        const recipeIngredients = document.createElement('div');
        recipeIngredients.className = 'recipe-ingredients';
        
        recipe.pattern.forEach(ingredient => {
            const ingredientSlot = document.createElement('div');
            ingredientSlot.className = 'ingredient-slot';
            
            if (ingredient) {
                const ingredientImg = document.createElement('img');
                ingredientImg.src = `./images/${ingredient}.png`;
                ingredientImg.alt = ingredient;
                ingredientSlot.appendChild(ingredientImg);
            }
            
            recipeIngredients.appendChild(ingredientSlot);
        });
        
        recipeItem.appendChild(recipeHeader);
        recipeItem.appendChild(recipeIngredients);
        recipesContainer.appendChild(recipeItem);
    });
}

// event listeners setup
function setupEventListeners() {
    // craft button
    const craftBtn = document.getElementById('craft-btn');
    craftBtn.addEventListener('click', handleCraftButtonClick);
    
    // reset button
    const resetBtn = document.getElementById('reset-btn');
    resetBtn.addEventListener('click', resetInventory);
    
    document.getElementById('gui-container').addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.slot')) {
            removeExistingTooltips();
        }
    });
}

// theme management
let isDarkTheme = false;

function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    const body = document.body;
    const themeButton = document.getElementById('theme-toggle-btn');
    const themeText = themeButton.querySelector('.theme-text');
    
    if (isDarkTheme) {
        // switch to dark theme
        body.style.backgroundImage = "url('images/bg2.png')";
        themeText.textContent = "NIGHT";
        themeButton.classList.add('dark-theme');
        playSound(523, 0.1); // C5 for night theme
        showSpeechBubble("Time for some night crafting! ");
    } else {
        // switch to light theme
        body.style.backgroundImage = "url('images/bg.jpg')";
        themeText.textContent = "DAY";
        themeButton.classList.remove('dark-theme');
        playSound(659, 0.1); // E5 for day theme
        showSpeechBubble("Perfect day for crafting! ");
    }
}

//  modal management
function showAboutModal() {
    const aboutModal = document.getElementById('about-modal');
    aboutModal.style.display = 'block';
    playSound(784, 0.1); // G5 for about modal
    showSpeechBubble("Check out this amazing project! ");
}

function setupModalEvents() {
}

// initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Start loading screen first
    initializeLoadingScreen();
    
    // Initialize the main inventory system
    initializeInventory();
});
