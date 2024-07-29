chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get('blockedDomains', function(data) {
      const domains = data.blockedDomains || [];
      const rules = domains.map((domain, index) => ({
        id: index + 1,
        priority: 1,
        action: { type: 'block' },
        condition: { urlFilter: domain, resourceTypes: ['main_frame'] }
      }));
  
      chrome.declarativeNetRequest.updateDynamicRules({
        addRules: rules,
        removeRuleIds: rules.map(rule => rule.id)
      });
    });
  });
  