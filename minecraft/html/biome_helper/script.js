let biomeIndex = 1;
const settings = ["temperature", "humidity", "continentalness", "erosion", "weirdness"];

function addBiome() {
    biomeIndex++;
    const biomeContainer = document.getElementById('biome-settings');
    const newBiome = document.createElement('div');
    newBiome.className = 'settings';
    newBiome.setAttribute('data-biome-index', biomeIndex);
    newBiome.innerHTML = `
        <h2>Biome ${biomeIndex}</h2>
        <div class="biome-name-group">
            <label>Biome Name:</label>
            <input type="text" class="biome-name" placeholder="Enter biome name" data-setting="name">
        </div>
        ${settings.map(setting => `
            <div class="range-group">
                <label>${setting.charAt(0).toUpperCase() + setting.slice(1)}</label>
                <input type="number" class="range-start" placeholder="Min" step="0.0001" min="-2" max="2" data-setting="${setting}">
                <input type="number" class="range-end" placeholder="Max" step="0.0001" min="-2" max="2" data-setting="${setting}">
            </div>
        `).join('')}
    `;
    biomeContainer.appendChild(newBiome);
}

function removeLastBiome() {
    const biomeContainer = document.getElementById('biome-settings');
    const lastBiome = document.querySelector('.settings:last-child');
    if (lastBiome) {
        biomeContainer.removeChild(lastBiome);
        biomeIndex--;
    }
}

function visualizeOverlap() {
    const barsContainer = document.getElementById('bars-container');
	barsContainer.innerHTML = '';
	barsContainer.innerHTML = '<h2>Biome Visualizer</h2><p>This shows the coverage of each setting of each biome.</p>';    
    const biomes = document.querySelectorAll('.settings');
    const barWidth = 500;
    const scale = barWidth / 4;

    biomes.forEach((biome, index) => {
        const biomeIndex = parseInt(biome.getAttribute('data-biome-index'), 10);
        const settingBars = document.createElement('div');
        settingBars.innerHTML = `<h3>Biome ${biomeIndex}</h3>`;
        barsContainer.appendChild(settingBars);

        settings.forEach(setting => {
            const rangeStart = parseFloat(biome.querySelector(`.range-start[data-setting="${setting}"]`).value);
            const rangeEnd = parseFloat(biome.querySelector(`.range-end[data-setting="${setting}"]`).value);

            if (isNaN(rangeStart) || isNaN(rangeEnd)) return;

            const bar = document.createElement('div');
            bar.className = 'bar';
            bar.style.width = `${barWidth}px`;
            settingBars.appendChild(bar);

            const overlay = document.createElement('div');
            overlay.style.position = 'absolute';
            overlay.style.left = `${(rangeStart + 2) * scale}px`;
            overlay.style.width = `${(rangeEnd - rangeStart) * scale}px`;
            overlay.style.backgroundColor = `rgba(${(index * 50) % 255}, ${(index * 100) % 255}, ${(index * 150) % 255}, 0.5)`;
            overlay.style.height = '100%';
            bar.appendChild(overlay);
        });
    });

    // Call function to calculate probabilities for each biome
    calculateBiomesProbabilities();
}

function updateBiomeStyles(biomeIndex) {
    const biome = document.querySelector(`.settings[data-biome-index="${biomeIndex}"]`);
    if (biome) {
        const inputs = biome.querySelectorAll('input');
        inputs.forEach(input => {
            input.style.borderColor = '#333';
            input.style.backgroundColor = '#2E2E2E';
        });

        // Additional styles or classes can be applied here if needed
    }
}

function calculateBiomesProbabilities() {
    const biomes = document.querySelectorAll('.settings');
    const probabilitiesContainer = document.getElementById('probabilities-container');
    probabilitiesContainer.innerHTML = '<h2>Biome Generation Probabilities</h2><p>This shows the estimated chance of the biome generating with the other biomes.</p>';
    const scale = 500 / 4;  // Scale based on the bar width

    biomes.forEach((biome, index) => {
        const biomeIndex = parseInt(biome.getAttribute('data-biome-index'), 10);
        let totalRange = 0;

        settings.forEach(setting => {
            const rangeStart = parseFloat(biome.querySelector(`.range-start[data-setting="${setting}"]`).value);
            const rangeEnd = parseFloat(biome.querySelector(`.range-end[data-setting="${setting}"]`).value);

            if (!isNaN(rangeStart) && !isNaN(rangeEnd)) {
                totalRange += (rangeEnd - rangeStart);
            }
        });

        const probability = (totalRange / (4 * settings.length)) * 100;
        const probabilityDiv = document.createElement('div');
        probabilityDiv.innerHTML = `
            <h3>Biome ${biomeIndex}: ${probability.toFixed(2)}%</h3>
        `;
        probabilitiesContainer.appendChild(probabilityDiv);
    });
}

function exportBiomesToJSON() {
    const biomes = document.querySelectorAll('.settings');
    const biomeData = [];

    biomes.forEach(biome => {
        const biomeIndex = parseInt(biome.getAttribute('data-biome-index'), 10);
        const settings = {};

        settings.name = biome.querySelector('.biome-name').value;

        settings.temperatureMin = parseFloat(biome.querySelector('.range-start[data-setting="temperature"]').value);
        settings.temperatureMax = parseFloat(biome.querySelector('.range-end[data-setting="temperature"]').value);

        settings.humidityMin = parseFloat(biome.querySelector('.range-start[data-setting="humidity"]').value);
        settings.humidityMax = parseFloat(biome.querySelector('.range-end[data-setting="humidity"]').value);

        settings.continentalnessMin = parseFloat(biome.querySelector('.range-start[data-setting="continentalness"]').value);
        settings.continentalnessMax = parseFloat(biome.querySelector('.range-end[data-setting="continentalness"]').value);

        settings.erosionMin = parseFloat(biome.querySelector('.range-start[data-setting="erosion"]').value);
        settings.erosionMax = parseFloat(biome.querySelector('.range-end[data-setting="erosion"]').value);

        settings.weirdnessMin = parseFloat(biome.querySelector('.range-start[data-setting="weirdness"]').value);
        settings.weirdnessMax = parseFloat(biome.querySelector('.range-end[data-setting="weirdness"]').value);

        biomeData.push({ biomeIndex, ...settings });
    });

    const json = JSON.stringify(biomeData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'biome_data.json';
    a.click();
    URL.revokeObjectURL(url);
}

document.getElementById('file-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const json = JSON.parse(e.target.result);
            resetBiomes();  // Reset existing biome settings
            addBiomesFromJSON(json);  // Add new biome settings
        };
        reader.readAsText(file);
    }
});

function resetBiomes() {
    const biomeContainer = document.getElementById('biome-settings');
    biomeContainer.innerHTML = '';
    biomeIndex = 0;
}

function addBiomesFromJSON(json) {
    const biomeContainer = document.getElementById('biome-settings');
    json.forEach(biome => {
        biomeIndex++;
        const newBiome = document.createElement('div');
        newBiome.className = 'settings';
        newBiome.setAttribute('data-biome-index', biomeIndex);
        newBiome.innerHTML = `
            <h2>Biome ${biomeIndex}</h2>
            <div class="biome-name-group">
                <label>Biome Name:</label>
                <input type="text" class="biome-name" value="${biome.name}" data-setting="name">
            </div>
            ${settings.map(setting => `
                <div class="range-group">
                    <label>${setting.charAt(0).toUpperCase() + setting.slice(1)}</label>
                    <input type="number" class="range-start" value="${biome[`${setting}Min`]}" step="0.0001" min="-2" max="2" data-setting="${setting}">
                    <input type="number" class="range-end" value="${biome[`${setting}Max`]}" step="0.0001" min="-2" max="2" data-setting="${setting}">
                </div>
            `).join('')}
        `;
        biomeContainer.appendChild(newBiome);
    });
}
