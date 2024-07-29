document.addEventListener('DOMContentLoaded', function() {
  const domainInput = document.getElementById('domainInput');
  const addButton = document.getElementById('addButton');
  const domainList = document.getElementById('domainList');
  const removeAllButton = document.getElementById('removeAllButton');

  // Load domains from storage
  chrome.storage.local.get('blocked_domains', function(data) {
    const domains = data.blocked_domains || [];
    domains.forEach(addDomainToList);
  });

  // Add domain to the list
  addButton.addEventListener('click', function() {
    const domain = domainInput.value.trim();
    if (domain) {
      chrome.storage.local.get('blocked_domains', function(data) {
        const domains = data.blocked_domains || [];
        if (!domains.includes(domain)) {
          domains.push(domain);
          chrome.storage.local.set({ blocked_domains: domains }, function() {
            addDomainToList(domain);
            updateBlockingRules(domains);
          });
        }
      });
    }
    domainInput.value = '';
  });

  // Remove domain from the list
  domainList.addEventListener('click', function(event) {
    if (event.target.classList.contains('remove-button') || event.target.closest('.remove-button')) {
      const domainElement = event.target.closest('.domain-item');
      const domain = domainElement.querySelector('.domain-name').textContent.trim();
      chrome.storage.local.get('blocked_domains', function(data) {
        const domains = data.blocked_domains || [];
        const updatedDomains = domains.filter(d => d !== domain);
        chrome.storage.local.set({ blocked_domains: updatedDomains }, function() {
          domainElement.remove();
          updateBlockingRules(updatedDomains);
        });
      });
    }
  });

  // Remove all domains from the list
  removeAllButton.addEventListener('click', function() {
    chrome.storage.local.set({ blocked_domains: [] }, function() {
      domainList.innerHTML = '';
      updateBlockingRules([]);
    });
  });

  // Add domain to the HTML list
  function addDomainToList(domain) {
    const main = document.createElement('div');
    const name = document.createElement('div');
    const button = document.createElement('div');
    const p = document.createElement('p');
    p.textContent = domain.toString();
    p.className = 'domain-name';
    name.appendChild(p);
    const removeButton = document.createElement('button');
    const icon = document.createElement('i');
    icon.className = 'fa fa-trash icon';
    removeButton.appendChild(icon);
    removeButton.className = 'remove-button';
    button.appendChild(removeButton);
    main.appendChild(name);
    main.appendChild(button);
    main.className = 'domain-item';
    domainList.appendChild(main);
  }

  // Update blocking rules
  function updateBlockingRules(domains) {
    // Create new rules based on the current domain list
    const newRules = domains.map((domain, index) => ({
      id: index + 1,
      priority: 1,
      action: { type: 'block' },
      condition: { urlFilter: domain.toString(), resourceTypes: ['main_frame'] }
    }));

    // Remove existing rules and add the new rules
    chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
      const existingRuleIds = existingRules.map(rule => rule.id);
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingRuleIds,
        addRules: newRules
      });
    });
  }
});
