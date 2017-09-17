const remote = require('electron').remote;
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;

// Build our new menu
var menu = new Menu()
menu.append(new MenuItem({
  label: 'Delete',
  click: function() {
    // Trigger an alert when menu item is clicked
    alert('Deleted')
  }
}))
menu.append(new MenuItem({
  label: 'More Info...',
  click: function() {
    // Trigger an alert when menu item is clicked
    alert('Here is more information')
  }
}))

// Add the listener
document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('.nav-group-item').addEventListener('click', function (event) {
    menu.popup(remote.getCurrentWindow());
  })
})
