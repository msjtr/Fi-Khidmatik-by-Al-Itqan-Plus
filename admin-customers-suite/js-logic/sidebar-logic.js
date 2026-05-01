window.handleSidebarClick = function(moduleName) {
    const frame = document.querySelector('iframe[name="content-view"]');
    const pages = {
        'dashboard': 'pages/customers-list.html',
        'customers': 'pages/add-customer.html',
        'stats': 'pages/customers-stats.html'
    };
    if (frame) frame.src = pages[moduleName] || pages['dashboard'];
};
