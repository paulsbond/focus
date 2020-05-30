import { Component, OnInit } from '@angular/core';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  completed = [];
  task = "";
  running = false;
  interval;
  startTime: number = null;
  startSeconds = 1500;
  remainingSeconds = this.startSeconds;

  ngOnInit() {
    this.storage_get("completed");
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
      if (this.remainingSeconds === 0) {
        this.completed.push({
          task: this.task,
          endTime: Date.now()
        });
        this.storage_set("completed");
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
    this.startSeconds = 1500;
    this.remainingSeconds = 1500;
    this.storage_del("startTime");
    this.storage_del("startSeconds");
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
