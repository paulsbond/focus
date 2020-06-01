import { Component, OnInit } from '@angular/core';

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

  ngOnInit() {
    this.storage_get("completed");
    this.storage_get("action");
    this.storage_get("task");
    this.storage_get("startTime");
    this.storage_get("startSeconds");
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
    this.storage_set("action");
    this.reset();
  }

  startPause() {
    if (this.running) {
      this.pause();
    } else {
      this.startTime = Date.now();
      this.storage_set("startTime");
      this.start();
    }
  }

  start() {
    this.running = true;
    this.interval = setInterval(() => {
      this.updateRemainingSeconds();
      if (this.remainingSeconds <= 0) {
        if (this.action === 'focus') {
          this.completed.push({
            task: this.task,
            endTime: this.startTime + this.startSeconds * 1000
          });
          this.storage_set("completed");
        }
        this.reset();
      }
    }, 1000);
  }

  pause() {
    clearInterval(this.interval);
    this.running = false;
    this.startTime = null;
    this.storage_del("startTime");
    this.startSeconds = this.remainingSeconds;
    this.storage_set("startSeconds");
  }

  reset() {
    if (this.running) {
      this.pause();
    }
    this.startTime = null;
    this.storage_del("startTime");
    if (this.action === 'focus') {
      this.startSeconds = 1500;
    } else if (this.action === 'short') {
      this.startSeconds = 300;
    } else if (this.action === 'long') {
      this.startSeconds = 1800;
    }
    this.storage_set("startSeconds");
    this.remainingSeconds = this.startSeconds;
  }

  clear() {
    this.completed = [];
    this.storage_del("completed");
  }

  taskKeyup() {
    this.storage_set("task");
  }

  storage_set(key: string): void {
    const storageKey = "focus." + key;
    localStorage.setItem(storageKey, JSON.stringify(this[key]));
  }

  storage_get(key: string): void {
    const storageKey = "focus." + key;
    const value = localStorage.getItem(storageKey);
    if (value !== null) {
      this[key] = JSON.parse(value);
    }
  }

  storage_del(key: string): void {
    const storageKey = "focus." + key;
    localStorage.removeItem(storageKey);
  }
}
