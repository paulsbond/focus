import { Component, OnInit } from '@angular/core';
import { Howl } from "howler";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  completed = [];
  action = "focus";
  task = "";
  running = false;
  startTime: number = null;
  startSeconds = 1500;
  remainingSeconds = this.startSeconds;
  private interval: NodeJS.Timeout;
  private chime = new Howl({ src: ["assets/sounds/chime.mp3"], volume: 0.5 });

  ngOnInit() {
    this.storageGet("completed");
    this.storageGet("action");
    this.storageGet("task");
    this.storageGet("startTime");
    this.storageGet("startSeconds");
    if (this.startTime !== null) {
      this.updateRemainingSeconds();
      this.start();
    } else {
      this.remainingSeconds = this.startSeconds;
    }
  }

  updateRemainingSeconds() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    this.remainingSeconds = this.startSeconds - elapsed;
  }

  changeAction(action: string) {
    if (action == this.action) return;
    this.action = action;
    this.storageSet("action");
    this.reset();
  }

  startPause() {
    if (this.running) {
      this.pause();
    } else {
      this.startTime = Date.now();
      this.storageSet("startTime");
      this.requestNotificationPermission();
      this.start();
    }
  }

  start() {
    this.running = true;
    this.interval = setInterval(() => {
      this.updateRemainingSeconds();
      if (this.remainingSeconds <= 0) {
        if (this.remainingSeconds >= -1) {
          this.chime.play();
          this.showNotification();
        }
        if (this.action === 'focus') {
          this.completed.push({
            task: this.task,
            endTime: this.startTime + this.startSeconds * 1000
          });
          this.storageSet("completed");
        }
        this.reset();
      }
    }, 1000);
  }

  pause() {
    clearInterval(this.interval);
    this.running = false;
    this.startTime = null;
    this.storageDel("startTime");
    this.startSeconds = this.remainingSeconds;
    this.storageSet("startSeconds");
  }

  reset() {
    if (this.running) {
      this.pause();
    }
    this.startTime = null;
    this.storageDel("startTime");
    if (this.action === 'focus') {
      this.startSeconds = 1500;
    } else if (this.action === 'short') {
      this.startSeconds = 300;
    } else if (this.action === 'long') {
      this.startSeconds = 1800;
    }
    this.storageSet("startSeconds");
    this.remainingSeconds = this.startSeconds;
  }

  clear() {
    this.completed = [];
    this.storageDel("completed");
  }

  taskKeyup() {
    this.storageSet("task");
  }

  storageSet(key: string): void {
    const storageKey = "focus." + key;
    localStorage.setItem(storageKey, JSON.stringify(this[key]));
  }

  storageGet(key: string): void {
    const storageKey = "focus." + key;
    const value = localStorage.getItem(storageKey);
    if (value !== null) {
      this[key] = JSON.parse(value);
    }
  }

  storageDel(key: string): void {
    const storageKey = "focus." + key;
    localStorage.removeItem(storageKey);
  }

  requestNotificationPermission() {
    if ("Notification" in window && navigator.serviceWorker) {
      Notification.requestPermission();
    }
  }

  showNotification() {
    if ("Notification" in window && navigator.serviceWorker) {
      navigator.serviceWorker.getRegistration().then(registration => {
        const title = this.action === "focus" ?
          "Focus session complete!" : "Time to focus.";
        const options = {
          icon: "assets/icons/icon.svg",
          vibrate: [100, 50, 100],
        };
        registration.showNotification(title, options);
      });
    }
  }
}
