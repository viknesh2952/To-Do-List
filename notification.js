//Ask permisison to user to show the notifications
if ('Notification' in window) {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
      } else {
        console.log('Notification permission denied.');
      }
    });
  }
//Register the service worker
if ('serviceWorker' in navigator) {
navigator.serviceWorker.register('service-worker.js').then(function (registration) {
    console.log('Service Worker registered with scope:', registration.scope);
});
}

//Activate notification click event
self.addEventListener('notificationclick', function (event) {
    event.notification.close(); // Close the notification
    // Focus or open the tasks page
    event.waitUntil(
      console.log(clients) && clients.openWindow('/tasks') // Change '/tasks' to your actual tasks page
    );
});
    
// Set up a timer to trigger the notification every 12 hours
// const twelveHours = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
const twelveHours = 1000*15;
setInterval(() => {
  // Add logic here to check for incomplete tasks
  const incompleteTasks = checkIncompleteTasks();
  if (incompleteTasks.length > 0) {
    showNotification();
  }
}, twelveHours);

function showNotification() {
    if (Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification('Task Reminder', {
          body: 'You have incomplete tasks! Check them now.',
          icon: '/icons/task-ico/To-Do-List/icons/icon-152x152.png', // Provide a valid icon path
          badge: '/To-Do-List/icons/icon-512x512.png', // Optional: smaller badge icon
          actions: [
            { action: 'view', title: 'View Tasks' }, // Button to open tasks
            { action: 'dismiss', title: 'Dismiss' } // Dismiss button
          ]
        });
      });
    }
}
  
// Example function to check incomplete tasks
function checkIncompleteTasks() {
let db;
const request = indexedDB.open("todoDB", 1);
request.onsuccess = function (event) {
    db = event.target.result;
};
const transaction = db.transaction("tasks", "readonly");
const tasksStore = transaction.objectStore("tasks");
const getRequest = tasksStore.getAll();

getRequest.onsuccess = function (event) {
    let incompleteTasks = event.target.result.filter((task)=> !task.completed);
    return JSON.parse(incompleteTasks); 
}

}
