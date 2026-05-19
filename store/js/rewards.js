const rewardsEl = document.querySelector("#rewards");
const featuredRewardEl = document.querySelector("#featuredReward");
const searchEl = document.querySelector("#search");
const sortEl = document.querySelector("#sort");
const toastEl = document.querySelector("#toast");

let rewards = [];

async function loadRewards() {
  const response = await fetch("rewards.json");
  rewards = await response.json();
  renderRewards();
}

function getTagsHtml(tags = []) {
  if (!tags.length) return "";

  return `
    <div class="tags">
      ${tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
    </div>
  `;
}

function getCommandButtonHtml(command) {
  return `
    <div class="command-label">Click to copy chat command:</div>
    <button class="command-box" type="button" data-command="${command}">
      <code>${command}</code>
      <span class="copy-icon" aria-hidden="true">📋</span>
    </button>
  `;
}

function renderFeaturedReward() {
  const featuredReward = rewards.find((reward) => reward.featured === true);

  if (!featuredReward) {
    featuredRewardEl.innerHTML = "";
    return;
  }

  featuredRewardEl.innerHTML = `
    <article class="featured-card">
      <img src="${featuredReward.thumbnail}" alt="${featuredReward.name}">
      <div class="featured-content">
        <div class="featured-kicker">Featured Reward</div>
        <h2 class="featured-title">${featuredReward.name}</h2>
        <div class="featured-cost">${featuredReward.cost.toLocaleString()} pts</div>
        ${getTagsHtml(featuredReward.tags)}
        <p class="description">${featuredReward.description}</p>
        ${getCommandButtonHtml(featuredReward.command)}
      </div>
    </article>
  `;
}

function renderRewards() {
  renderFeaturedReward();

  const query = searchEl.value.toLowerCase().trim();
  const sort = sortEl.value;

  let visibleRewards = rewards.filter((reward) => {
    const tags = reward.tags || [];

    const matchesSearch =
      reward.name.toLowerCase().includes(query) ||
      reward.description.toLowerCase().includes(query) ||
      reward.command.toLowerCase().includes(query) ||
      tags.some((tag) => tag.toLowerCase().includes(query));

    const isNotFeatured = reward.featured !== true;

    return matchesSearch && isNotFeatured;
  });

  visibleRewards.sort((a, b) => {
    if (sort === "cost-low") return a.cost - b.cost;
    if (sort === "cost-high") return b.cost - a.cost;
    return a.name.localeCompare(b.name);
  });

  if (visibleRewards.length === 0) {
    rewardsEl.innerHTML = `<div class="empty">No rewards found.</div>`;
    return;
  }

  rewardsEl.innerHTML = visibleRewards.map((reward) => `
    <article class="card">
      <img src="${reward.thumbnail}" alt="${reward.name}">
      <div class="card-body">
        <div class="name-row">
          <h2>${reward.name}</h2>
        </div>
        <div class="cost">${reward.cost.toLocaleString()} pts</div>
        ${getTagsHtml(reward.tags)}
        <p class="description">${reward.description}</p>
        ${getCommandButtonHtml(reward.command)}
      </div>
    </article>
  `).join("");
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");

  setTimeout(() => {
    toastEl.classList.remove("show");
  }, 1600);
}

document.addEventListener("click", async (event) => {
  const button = event.target.closest(".command-box");
  if (!button) return;

  const command = button.dataset.command;

  try {
    await navigator.clipboard.writeText(command);

    const icon = button.querySelector(".copy-icon");
    const originalIcon = icon.textContent;

    icon.textContent = "✅";
    button.classList.add("copied");

    showToast(`Copied ${command}`);

    setTimeout(() => {
      icon.textContent = originalIcon;
      button.classList.remove("copied");
    }, 1200);
  } catch (error) {
    showToast(`Copy this command: ${command}`);
  }
});

searchEl.addEventListener("input", renderRewards);
sortEl.addEventListener("change", renderRewards);

loadRewards();
